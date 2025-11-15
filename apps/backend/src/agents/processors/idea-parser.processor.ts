import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { HuggingFaceService } from '../../huggingface/huggingface.service';
import { RAGService } from '@omniforge/rag';
import { LLMService } from '@omniforge/llm';
import { TemplateRetrievalService } from '@omniforge/knowledge-base';
import { IdeaParserAgent } from '@omniforge/redix';
import { Idea } from '@omniforge/shared';
import { Logger } from '@nestjs/common';

interface ParseJob {
  ideaId: string;
  rawInput: string;
  title: string;
  description?: string;
}

@Processor('idea-parser')
export class IdeaParserProcessor extends WorkerHost {
  private readonly logger = new Logger(IdeaParserProcessor.name);

  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeService,
    private huggingFace: HuggingFaceService,
    private rag: RAGService,
    private llm: LLMService,
    private templateRetrieval: TemplateRetrievalService,
  ) {
    super();
  }

  async process(job: Job<ParseJob>): Promise<any> {
    const { ideaId, rawInput, title, description } = job.data;

    this.logger.log(`Processing idea parsing job with Hugging Face for idea ${ideaId}`);

    try {
      // Update status to PARSING
      await this.prisma.idea.update({
        where: { id: ideaId },
        data: { status: 'PARSING' },
      });

      await this.realtime.emit(`idea:${ideaId}`, 'idea.parsing', { ideaId, progress: 0 });

      // Get the idea
      const idea = await this.prisma.idea.findUnique({ where: { id: ideaId } });
      if (!idea) {
        throw new Error(`Idea ${ideaId} not found`);
      }

      // Create agent with RAG + Multi-LLM
      const ideaParserAgent = new IdeaParserAgent(this.rag, this.llm, this.templateRetrieval);

      // Parse the idea using RAG + Multi-LLM
      this.logger.log(`Parsing idea with RAG + Multi-LLM: ${title}`);
      await this.realtime.emit(`idea:${ideaId}`, 'idea.parsing', { ideaId, progress: 20 });

      // Convert null to undefined for compatibility with Idea type
      const ideaForParsing: Idea = {
        ...idea,
        description: idea.description ?? undefined,
        rawInput: idea.rawInput ?? undefined,
        parentIdeaId: idea.parentIdeaId ?? undefined,
        specJson: idea.specJson ?? undefined,
      };
      const spec = await ideaParserAgent.parseIdea(ideaForParsing);

      await this.realtime.emit(`idea:${ideaId}`, 'idea.parsing', { ideaId, progress: 80 });

      // Store knowledge graph relationships
      await this.storeInKnowledgeGraph(ideaId, spec);

      // Index for semantic search using Hugging Face embeddings
      await this.indexForSearch(ideaId, rawInput || title);

      // Update idea with parsed spec
      const updated = await this.prisma.idea.update({
        where: { id: ideaId },
        data: {
          status: 'PARSED',
          specJson: spec as any,
        },
      });

      await this.realtime.emit(`idea:${ideaId}`, 'idea.parsed', updated);

      this.logger.log(`Successfully parsed idea ${ideaId} with Hugging Face`);

      return { ideaId, spec };
    } catch (error) {
      this.logger.error(`Error parsing idea ${ideaId}:`, error);

      await this.prisma.idea.update({
        where: { id: ideaId },
        data: {
          status: 'FAILED',
        },
      });

      await this.realtime.emit(`idea:${ideaId}`, 'idea.parse_failed', {
        ideaId,
        error: error.message,
      });

      throw error;
    }
  }

  private async storeInKnowledgeGraph(ideaId: string, spec: any): Promise<void> {
    // TODO: Implement Neo4j storage
    this.logger.log(`Storing idea ${ideaId} in knowledge graph`);
  }

  private async indexForSearch(ideaId: string, content: string): Promise<void> {
    // Generate embeddings using Hugging Face
    try {
      const embedding = await this.huggingFace.generateEmbedding(content);
      this.logger.log(`Generated embedding for idea ${ideaId} (${embedding.length} dimensions)`);
      // TODO: Store embedding in Qdrant
    } catch (error) {
      this.logger.warn(`Failed to index idea ${ideaId} for search:`, error);
    }
  }
}
