export type DocumentType = 'pdf' | 'image' | 'audio' | 'text' | 'markdown';

export interface ProcessedDocument {
  type: DocumentType;
  content: string;
  metadata: {
    filename?: string;
    mimeType?: string;
    size?: number;
    pages?: number;
    duration?: number; // for audio
    extractedAt: Date;
    [key: string]: any;
  };
  extractedText?: string;
  images?: string[]; // Base64 encoded
  tables?: Array<{ headers: string[]; rows: string[][] }>;
}

