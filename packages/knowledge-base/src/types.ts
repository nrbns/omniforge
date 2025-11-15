export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: 'template' | 'pattern' | 'best_practice' | 'example' | 'documentation';
  tags: string[];
  metadata: {
    source?: string;
    createdAt: Date;
    updatedAt: Date;
    usageCount?: number;
    rating?: number;
    [key: string]: any;
  };
  embedding?: number[];
}

export interface TemplateMatch {
  template: KnowledgeEntry;
  similarity: number;
  matchReasons: string[];
}

