import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdeasSearchService } from './ideas-search.service';
import { AgentsService } from '../agents/agents.service';
import { RealtimeService } from '../realtime/realtime.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateIdeaDto, UpdateIdeaDto, CommitIdeaDto, BranchIdeaDto } from './dto';

@Injectable()
export class IdeasService {
  constructor(
    private prisma: PrismaService,
    private agentsService: AgentsService,
    private realtimeService: RealtimeService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async create(dto: CreateIdeaDto) {
    const idea = await this.prisma.idea.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        description: dto.description,
        rawInput: dto.rawInput,
        status: 'DRAFT',
      },
      include: {
        user: true,
      },
    });

    // Emit realtime event
    await this.realtimeService.emit(`idea:${idea.id}`, 'idea.created', idea);

    return idea;
  }

  async findAll(userId?: string) {
    const where = userId ? { userId } : {};
    return this.prisma.idea.findMany({
      where,
      include: {
        user: true,
        _count: {
          select: {
            commits: true,
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const idea = await this.prisma.idea.findUnique({
      where: { id },
      include: {
        user: true,
        commits: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        projects: true,
        branches: true,
      },
    });

    if (!idea) {
      throw new NotFoundException(`Idea with ID ${id} not found`);
    }

    return idea;
  }

  async getSpec(id: string) {
    const idea = await this.findOne(id);
    return {
      id: idea.id,
      spec: idea.specJson,
      status: idea.status,
    };
  }

  async update(id: string, dto: UpdateIdeaDto) {
    const idea = await this.prisma.idea.update({
      where: { id },
      data: dto,
      include: {
        user: true,
      },
    });

    await this.realtimeService.emit(`idea:${id}`, 'idea.updated', idea);

    return idea;
  }

  async commit(id: string, dto: CommitIdeaDto) {
    const idea = await this.findOne(id);

    const commit = await this.prisma.commit.create({
      data: {
        ideaId: id,
        userId: dto.userId,
        type: dto.type,
        message: dto.message,
        branch: dto.branch || idea.branch,
        diff: dto.diff,
        specSnapshot: idea.specJson ?? undefined,
      },
    });

    await this.realtimeService.emit(`idea:${id}`, 'idea.committed', commit);

    return commit;
  }

  async branch(id: string, dto: BranchIdeaDto) {
    const parentIdea = await this.findOne(id);

    const branchIdea = await this.prisma.idea.create({
      data: {
        userId: parentIdea.userId,
        title: `${parentIdea.title} (${dto.branchName})`,
        description: parentIdea.description,
        rawInput: parentIdea.rawInput,
        specJson: parentIdea.specJson ?? undefined,
        branch: dto.branchName,
        parentIdeaId: id,
        status: parentIdea.status,
      },
    });

    await this.prisma.commit.create({
      data: {
        ideaId: branchIdea.id,
        userId: parentIdea.userId,
        type: 'BRANCH',
        message: `Branched from ${id}`,
        branch: dto.branchName,
      },
    });

    await this.realtimeService.emit(`idea:${id}`, 'idea.branched', branchIdea);

    return branchIdea;
  }

  async parseIdea(id: string) {
    const idea = await this.findOne(id);

    if (idea.status !== 'DRAFT' && idea.status !== 'PARSING') {
      throw new Error(`Idea ${id} is not in a parseable state`);
    }

    // Update status
    await this.prisma.idea.update({
      where: { id },
      data: { status: 'PARSING' },
    });

    // Trigger parsing agent
    const spec = await this.agentsService.parseIdea(idea);

    // Update idea with spec
    const updated = await this.prisma.idea.update({
      where: { id },
      data: {
        status: 'PARSED',
        specJson: spec,
      },
    });

    await this.realtimeService.emit(`idea:${id}`, 'idea.parsed', updated);

    return updated;
  }

  /**
   * Stream AI-generated improvements to idea description in real-time.
   * Uses RealtimeGateway to inject text directly into Yjs document.
   */
  async streamAIImprovements(ideaId: string, prompt?: string) {
    const idea = await this.findOne(ideaId);
    const currentDescription = idea.description || idea.rawInput || '';

    // Simple AI prompt (in production, use actual LLM streaming)
    const aiPrompt = prompt || `Improve and expand this idea description: "${currentDescription}"`;
    
    // Simulate streaming AI response (in production, use actual LLM streaming)
    const improvements = [
      'This idea has great potential. ',
      'Here are some key enhancements: ',
      '1. Add user authentication for security\n',
      '2. Implement real-time notifications\n',
      '3. Include analytics dashboard\n',
      '4. Add mobile app support\n',
    ];

    // Stream chunks into Yjs document
    const roomId = `idea:${ideaId}`;
    let position = currentDescription.length;
    for (const chunk of improvements) {
      const result = await this.realtimeGateway.injectAIContent(roomId, 'description', chunk, position);
      position = result.position;
      // Small delay to simulate streaming
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return {
      success: true,
      message: 'AI improvements streamed to document',
      chunks: improvements.length,
    };
  }

  /**
   * Find similar ideas
   */
  async findSimilar(ideaId: string, limit: number = 10): Promise<any[]> {
    if (!this.searchService) {
      return [];
    }
    // Try knowledge graph first
    const graphResults = await this.searchService.getSimilarFromGraph(ideaId, limit);
    if (graphResults.length > 0) {
      return graphResults;
    }

    // Fallback to semantic search
    return this.searchService.searchSimilar(ideaId, limit);
  }

  /**
   * Search ideas
   */
  async search(query: string, limit: number = 20): Promise<any[]> {
    if (!this.searchService) {
      // Fallback to basic text search
      return this.prisma.idea.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.searchService.search(query, limit);
  }
}
