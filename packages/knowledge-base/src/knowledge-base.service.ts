import { KnowledgeEntry } from './types';
import { VectorStoreService } from '@omniforge/rag';

export class KnowledgeBaseService {
  private vectorStore: VectorStoreService;
  private knowledgeEntries: Map<string, KnowledgeEntry> = new Map();

  constructor(vectorStore: VectorStoreService) {
    this.vectorStore = vectorStore;
  }

  /**
   * Add knowledge entry
   */
  async addEntry(entry: KnowledgeEntry): Promise<void> {
    this.knowledgeEntries.set(entry.id, entry);
    
    // Store in vector database
    await this.vectorStore.upsert('knowledge_base', [{
      id: entry.id,
      content: entry.content,
      metadata: {
        type: entry.category === 'example' ? 'template' : entry.category as 'idea' | 'code' | 'template' | 'knowledge' | 'user_input',
        title: entry.title,
        tags: entry.tags,
        ...entry.metadata,
      },
      embedding: entry.embedding,
    }]);
  }

  /**
   * Search knowledge base
   */
  async search(query: string, category?: string, limit: number = 10): Promise<KnowledgeEntry[]> {
    // Search in vector store
    const embeddingModel = (this.vectorStore as any).embeddingModel;
    if (!embeddingModel) {
      return [];
    }

    const queryEmbedding = await embeddingModel.generateEmbedding(query);
    const results = await this.vectorStore.search('knowledge_base', queryEmbedding, limit);

    // Filter by category if specified
    let entries = results
      .map((r) => {
        const entry = this.knowledgeEntries.get(r.document.id);
        return entry ? { entry, score: r.score } : null;
      })
      .filter((item): item is { entry: KnowledgeEntry; score: number } => item !== null);

    if (category) {
      entries = entries.filter((item) => item.entry.category === category);
    }

    return entries.map((item) => item.entry);
  }

  /**
   * Get entry by ID
   */
  getEntry(id: string): KnowledgeEntry | undefined {
    return this.knowledgeEntries.get(id);
  }

  /**
   * Update entry usage
   */
  async updateUsage(id: string): Promise<void> {
    const entry = this.knowledgeEntries.get(id);
    if (entry) {
      entry.metadata.usageCount = (entry.metadata.usageCount || 0) + 1;
      this.knowledgeEntries.set(id, entry);
    }
  }
}

