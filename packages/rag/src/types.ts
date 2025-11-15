export interface Document {
  id: string;
  content: string;
  metadata: {
    type: 'idea' | 'code' | 'template' | 'knowledge' | 'user_input';
    source?: string;
    createdAt: Date;
    tags?: string[];
    [key: string]: any;
  };
  embedding?: number[];
}

export interface RetrievalResult {
  document: Document;
  score: number;
  relevance: number;
}

export interface QueryResult {
  results: RetrievalResult[];
  query: string;
  queryEmbedding: number[];
  retrievedAt: Date;
}

export interface RAGContext {
  query: string;
  retrievedDocs: Document[];
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  relevantContext?: string;
  maxTokens?: number;
}

export interface RAGResponse {
  answer: string;
  sources: Document[];
  confidence: number;
  reasoning?: string;
}

