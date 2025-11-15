export class SearchAgent {
  private huggingFaceService: any;
  private vectorDBService: any;

  constructor(huggingFaceService?: any, vectorDBService?: any) {
    this.huggingFaceService = huggingFaceService;
    this.vectorDBService = vectorDBService;
  }

  /**
   * Performs semantic search using Hugging Face embeddings
   */
  async searchIdeas(query: string, limit: number = 10): Promise<any[]> {
    if (!this.huggingFaceService || !this.vectorDBService) {
      console.warn('Hugging Face or Vector DB service not available');
      return [];
    }

    try {
      // Use VectorDB service which uses Hugging Face for embeddings
      const results = await this.vectorDBService.search('ideas', query, limit);
      return results;
    } catch (error) {
      console.error('Error searching ideas:', error);
      return [];
    }
  }

  async indexIdea(ideaId: string, content: string): Promise<void> {
    if (!this.vectorDBService) {
      console.warn('Vector DB service not available');
      return;
    }

    try {
      await this.vectorDBService.upsert('ideas', [
        {
          id: ideaId,
          text: content,
        },
      ]);
      console.log(`Indexed idea ${ideaId}`);
    } catch (error) {
      console.error(`Error indexing idea ${ideaId}:`, error);
      throw error;
    }
  }

  async updateIndex(ideaId: string, content: string): Promise<void> {
    // For update, we can delete and re-index, or upsert handles it
    await this.indexIdea(ideaId, content);
  }

  async deleteIndex(ideaId: string): Promise<void> {
    if (!this.vectorDBService) {
      console.warn('Vector DB service not available');
      return;
    }

    try {
      await this.vectorDBService.delete('ideas', [ideaId]);
      console.log(`Deleted index for idea ${ideaId}`);
    } catch (error) {
      console.error(`Error deleting index for idea ${ideaId}:`, error);
      throw error;
    }
  }
}

