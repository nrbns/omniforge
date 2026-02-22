import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Neo4jService } from '../neo4j/neo4j.service';
import { HuggingFaceService } from '../huggingface/huggingface.service';

@Injectable()
export class IdeasSearchService {
  private readonly logger = new Logger(IdeasSearchService.name);

  constructor(
    private prisma: PrismaService,
    private neo4j: Neo4jService,
    private huggingFace: HuggingFaceService,
  ) {}

  /**
   * Semantic search for similar ideas
   */
  async searchSimilar(ideaId: string, limit: number = 10): Promise<any[]> {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      include: { commits: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!idea) {
      throw new Error('Idea not found');
    }

    // Generate embedding for the idea
    const embedding = await this.huggingFace.generateEmbedding(
      `${idea.title} ${idea.description || ''}`,
    );

    // Vector search (simplified - in production, use Qdrant/Milvus)
    // For now, use text similarity via Prisma
    const similarIdeas = await this.prisma.idea.findMany({
      where: {
        id: { not: ideaId },
        OR: [
          { title: { contains: idea.title.split(' ')[0], mode: 'insensitive' } },
          { description: { contains: idea.description?.substring(0, 50) || '', mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: { commits: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    return similarIdeas.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      similarity: 0.8, // Placeholder - calculate from embedding distance
    }));
  }

  /**
   * Search ideas by query
   */
  async search(query: string, limit: number = 20): Promise<any[]> {
    // Generate embedding for query
    const queryEmbedding = await this.huggingFace.generateEmbedding(query);

    // Search in database (simplified)
    const results = await this.prisma.idea.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: { commits: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });

    return results;
  }

  /**
   * Build knowledge graph relationships
   */
  async buildKnowledgeGraph(ideaId: string): Promise<void> {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      include: { commits: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    const currentCommit = idea?.commits?.[0];
    if (!idea || !currentCommit) {
      return;
    }

    const spec = (currentCommit.specSnapshot ?? {}) as any;

    // Extract concepts from spec
    const concepts: string[] = [];
    if (spec.dataModels) {
      spec.dataModels.forEach((model: any) => {
        concepts.push(model.name);
        if (model.fields) {
          model.fields.forEach((field: any) => {
            concepts.push(field.name);
          });
        }
      });
    }

    if (spec.pages) {
      spec.pages.forEach((page: any) => {
        concepts.push(page.name);
      });
    }

    // Create nodes in Neo4j
    try {
      // Create idea node
      await this.neo4j.runQuery(
        `
        MERGE (i:Idea {id: $ideaId})
        SET i.title = $title,
            i.description = $description
        `,
        {
          ideaId,
          title: idea.title,
          description: idea.description || '',
        },
      );

      // Create concept nodes and relationships
      for (const concept of concepts) {
        await this.neo4j.runQuery(
          `
          MERGE (c:Concept {name: $concept})
          MERGE (i:Idea {id: $ideaId})
          MERGE (i)-[:USES]->(c)
          `,
          {
            concept,
            ideaId,
          },
        );
      }

      // Find similar concepts and create relationships
      for (const concept of concepts) {
        const similar = await this.neo4j.runQuery(
          `
          MATCH (c:Concept {name: $concept})
          MATCH (other:Concept)
          WHERE other.name <> $concept
          AND (other.name CONTAINS $concept OR $concept CONTAINS other.name)
          MERGE (c)-[:SIMILAR_TO]->(other)
          RETURN other.name as name
          LIMIT 5
          `,
          { concept },
        );

        // Create relationships between ideas using similar concepts
        for (const similarConcept of similar) {
          await this.neo4j.runQuery(
            `
            MATCH (i1:Idea {id: $ideaId})
            MATCH (c1:Concept {name: $concept})
            MATCH (c2:Concept {name: $similarConcept})
            MATCH (i2:Idea)-[:USES]->(c2)
            WHERE i2.id <> $ideaId
            MERGE (i1)-[:SIMILAR_TO]->(i2)
            `,
            {
              ideaId,
              concept,
              similarConcept: similarConcept.name,
            },
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to build knowledge graph:', error);
    }
  }

  /**
   * Get similar ideas from knowledge graph
   */
  async getSimilarFromGraph(ideaId: string, limit: number = 10): Promise<any[]> {
    try {
      const result = await this.neo4j.run(
        `
        MATCH (i1:Idea {id: $ideaId})-[:SIMILAR_TO]->(i2:Idea)
        RETURN i2.id as id, i2.title as title, i2.description as description
        LIMIT $limit
        `,
        { ideaId, limit },
      );

      return result.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        source: 'knowledge_graph',
      }));
    } catch (error) {
      this.logger.error('Failed to query knowledge graph:', error);
      return [];
    }
  }
}

