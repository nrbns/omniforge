import { KnowledgeEntry, TemplateMatch } from './types';
import { KnowledgeBaseService } from './knowledge-base.service';
import { VectorStoreService } from '../rag/src/vector-store.service';

export class TemplateRetrievalService {
  private knowledgeBase: KnowledgeBaseService;
  private vectorStore: VectorStoreService;

  constructor(knowledgeBase: KnowledgeBaseService, vectorStore: VectorStoreService) {
    this.knowledgeBase = knowledgeBase;
    this.vectorStore = vectorStore;
  }

  /**
   * Find matching templates for an idea
   */
  async findTemplates(ideaDescription: string, limit: number = 5): Promise<TemplateMatch[]> {
    // Search for template category entries
    const templates = await this.knowledgeBase.search(ideaDescription, 'template', limit * 2);

    // Generate embedding for idea
    const embeddingModel = (this.vectorStore as any).embeddingModel;
    if (!embeddingModel) {
      return templates.map((t) => ({
        template: t,
        similarity: 0.5,
        matchReasons: ['Template available'],
      }));
    }

    const ideaEmbedding = await embeddingModel.generateEmbedding(ideaDescription);

    // Calculate similarity for each template
    const matches: TemplateMatch[] = [];

    for (const template of templates) {
      if (template.embedding) {
        const similarity = this.cosineSimilarity(ideaEmbedding, template.embedding);
        const matchReasons = this.extractMatchReasons(ideaDescription, template);

        matches.push({
          template,
          similarity,
          matchReasons,
        });
      }
    }

    // Sort by similarity and return top matches
    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Get best matching template
   */
  async getBestTemplate(ideaDescription: string): Promise<TemplateMatch | null> {
    const matches = await this.findTemplates(ideaDescription, 1);
    return matches.length > 0 ? matches[0] : null;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private extractMatchReasons(idea: string, template: KnowledgeEntry): string[] {
    const reasons: string[] = [];
    const ideaLower = idea.toLowerCase();
    
    // Check tag matches
    template.tags.forEach((tag) => {
      if (ideaLower.includes(tag.toLowerCase())) {
        reasons.push(`Matches tag: ${tag}`);
      }
    });

    // Check category match
    if (template.category === 'template') {
      reasons.push('Template available');
    }

    return reasons;
  }
}

