import axios from 'axios';
import { Document, RetrievalResult } from './types';

export class VectorStoreService {
  private qdrantUrl: string;
  private qdrantApiKey?: string;
  private embeddingModel: any;

  constructor(qdrantUrl: string, qdrantApiKey?: string, embeddingModel?: any) {
    this.qdrantUrl = qdrantUrl;
    this.qdrantApiKey = qdrantApiKey;
    this.embeddingModel = embeddingModel;
  }

  /**
   * Initialize collection in Qdrant
   */
  async initCollection(collectionName: string, vectorSize: number = 384): Promise<void> {
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (this.qdrantApiKey) {
        headers['api-key'] = this.qdrantApiKey;
      }

      await axios.put(
        `${this.qdrantUrl}/collections/${collectionName}`,
        {
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
        },
        { headers }
      );
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Collection already exists
        return;
      }
      throw error;
    }
  }

  /**
   * Store documents with embeddings
   */
  async upsert(collectionName: string, documents: Document[]): Promise<void> {
    if (!this.embeddingModel) {
      throw new Error('Embedding model not configured');
    }

    // Generate embeddings for all documents
    const points = await Promise.all(
      documents.map(async (doc) => {
        const embedding = doc.embedding || await this.embeddingModel.generateEmbedding(doc.content);
        return {
          id: doc.id,
          vector: embedding,
          payload: {
            content: doc.content,
            metadata: doc.metadata,
          },
        };
      })
    );

    const headers: any = { 'Content-Type': 'application/json' };
    if (this.qdrantApiKey) {
      headers['api-key'] = this.qdrantApiKey;
    }

    await axios.put(
      `${this.qdrantUrl}/collections/${collectionName}/points`,
      { points },
      { headers }
    );
  }

  /**
   * Search for similar documents
   */
  async search(
    collectionName: string,
    queryEmbedding: number[],
    limit: number = 10,
    scoreThreshold: number = 0.7
  ): Promise<RetrievalResult[]> {
    const headers: any = { 'Content-Type': 'application/json' };
    if (this.qdrantApiKey) {
      headers['api-key'] = this.qdrantApiKey;
    }

    const response = await axios.post(
      `${this.qdrantUrl}/collections/${collectionName}/points/search`,
      {
        vector: queryEmbedding,
        limit,
        score_threshold: scoreThreshold,
        with_payload: true,
      },
      { headers }
    );

    return response.data.result.map((hit: any) => ({
      document: {
        id: hit.id,
        content: hit.payload.content,
        metadata: hit.payload.metadata,
        embedding: hit.vector,
      },
      score: hit.score,
      relevance: hit.score * 100,
    }));
  }

  /**
   * Hybrid search (vector + keyword)
   */
  async hybridSearch(
    collectionName: string,
    queryEmbedding: number[],
    queryText: string,
    limit: number = 10
  ): Promise<RetrievalResult[]> {
    // Vector search
    const vectorResults = await this.search(collectionName, queryEmbedding, limit * 2);

    // Keyword search (simple text matching)
    const keywordResults = vectorResults.filter((result) =>
      result.document.content.toLowerCase().includes(queryText.toLowerCase())
    );

    // Combine and deduplicate
    const combined = new Map<string, RetrievalResult>();
    
    vectorResults.forEach((result) => {
      const existing = combined.get(result.document.id);
      if (!existing || result.score > existing.score) {
        combined.set(result.document.id, result);
      }
    });

    keywordResults.forEach((result) => {
      const existing = combined.get(result.document.id);
      const boostedScore = existing ? existing.score * 1.2 : result.score;
      combined.set(result.document.id, { ...result, score: boostedScore });
    });

    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Delete documents
   */
  async delete(collectionName: string, documentIds: string[]): Promise<void> {
    const headers: any = { 'Content-Type': 'application/json' };
    if (this.qdrantApiKey) {
      headers['api-key'] = this.qdrantApiKey;
    }

    await axios.post(
      `${this.qdrantUrl}/collections/${collectionName}/points/delete`,
      { points: documentIds },
      { headers }
    );
  }
}

