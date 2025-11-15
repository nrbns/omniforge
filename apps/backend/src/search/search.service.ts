import { Injectable } from '@nestjs/common';
import { RetrievalService } from '@omniforge/rag';
import { RAGService } from '@omniforge/rag';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(
    private retrieval: RetrievalService,
    private rag: RAGService,
    private prisma: PrismaService,
  ) {}

  /**
   * Hybrid search across ideas, templates, and knowledge base
   */
  async hybridSearch(query: string, limit: number = 10) {
    // Search in ideas
    const ideas = await this.prisma.idea.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });

    // Vector search
    const vectorResults = await this.retrieval.retrieve(query, 'omniforge', limit, true);

    // Knowledge base search
    const knowledgeBase = require('@omniforge/knowledge-base').KnowledgeBaseService;
    // This would need proper injection, simplified here

    return {
      ideas,
      vectorResults: vectorResults.results,
      query,
      totalResults: ideas.length + vectorResults.results.length,
    };
  }

  /**
   * Semantic search using embeddings
   */
  async semanticSearch(query: string, limit: number = 10) {
    const results = await this.retrieval.retrieve(query, 'omniforge', limit, true);
    return results;
  }

  /**
   * RAG-enhanced search with generated answers
   */
  async ragSearch(query: string, limit: number = 10) {
    // First retrieve documents
    const queryResult = await this.retrieval.retrieve(query, 'omniforge', limit);
    const retrievedDocs = queryResult.results?.map(r => r.document) || [];
    
    const response = await this.rag.generate({
      query,
      retrievedDocs,
      maxTokens: 1024,
    });

    return {
      answer: response.answer,
      sources: response.sources,
      confidence: response.confidence,
    };
  }
}

