export const HUGGINGFACE_MODELS = {
  // Text generation and understanding
  TEXT_GENERATION: 'mistralai/Mistral-7B-Instruct-v0.2',
  CODE_GENERATION: 'bigcode/starcoder',
  CODE_COMPLETION: 'bigcode/starcoderbase',
  
  // Embeddings for semantic search
  EMBEDDINGS: 'sentence-transformers/all-MiniLM-L6-v2',
  MULTILINGUAL_EMBEDDINGS: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
  
  // Text classification and understanding
  TEXT_CLASSIFICATION: 'distilbert-base-uncased-finetuned-sst-2-english',
  SENTIMENT_ANALYSIS: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
  
  // Code understanding
  CODE_BERT: 'microsoft/codebert-base',
  
  // Question answering for idea extraction
  QA_MODEL: 'deepset/roberta-base-squad2',
} as const;

export interface HuggingFaceConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface EmbeddingResponse {
  embedding: number[];
}

export interface TextGenerationResponse {
  generated_text: string;
}

export interface ClassificationResponse {
  label: string;
  score: number;
}

