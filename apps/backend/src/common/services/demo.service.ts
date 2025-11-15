import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';

/**
 * Demo service for running OmniForge without API keys
 * Provides mock responses for all AI operations
 */
@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);
  private isDemoMode: boolean;

  constructor() {
    this.isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.HUGGINGFACE_API_KEY;
    if (this.isDemoMode) {
      this.logger.warn('🚀 Running in DEMO MODE - Using mock AI responses');
    }
  }

  isEnabled(): boolean {
    return this.isDemoMode;
  }

  /**
   * Mock idea parsing
   */
  async mockParseIdea(idea: { title: string; description?: string; rawInput?: string }): Promise<any> {
    this.logger.log('📝 [DEMO] Mock parsing idea: ' + idea.title);

    // Simulate processing delay
    await this.delay(1000);

    return {
      version: '1.0.0',
      name: idea.title,
      description: idea.description || '',
      pages: this.extractMockPages(idea),
      dataModels: this.extractMockModels(idea),
      apis: this.extractMockAPIs(idea),
      realtime: [],
      integrations: this.extractMockIntegrations(idea),
      ui: {
        theme: 'light',
        primaryColor: '#3b82f6',
      },
      generatedAt: new Date().toISOString(),
      _demo: true,
    };
  }

  /**
   * Mock code generation
   */
  async mockGenerateCode(prompt: string, language: string = 'typescript'): Promise<string> {
    this.logger.log(`💻 [DEMO] Mock generating ${language} code`);
    await this.delay(500);

    // Return mock code based on prompt
    if (prompt.includes('component') || prompt.includes('page')) {
      return this.generateMockReactComponent();
    }
    if (prompt.includes('api') || prompt.includes('endpoint')) {
      return this.generateMockAPI();
    }
    if (prompt.includes('schema') || prompt.includes('model')) {
      return this.generateMockSchema();
    }

    return `// [DEMO MODE] Generated ${language} code\n// ${prompt.slice(0, 100)}...\n\nexport const demo = true;`;
  }

  /**
   * Mock embeddings (returns deterministic mock vectors)
   */
  async mockGenerateEmbedding(text: string): Promise<number[]> {
    // Generate deterministic mock embedding (384 dimensions for sentence-transformers)
    const embedding = new Array(384).fill(0).map((_, i) => {
      const hash = this.hashCode(text + i);
      return (hash % 1000) / 1000 - 0.5; // Normalize to -0.5 to 0.5
    });
    return embedding;
  }

  private extractMockPages(idea: any): any[] {
    const pages = [{ id: 'home', name: 'Home', path: '/', components: [] }];
    const text = `${idea.description} ${idea.rawInput}`.toLowerCase();

    if (text.includes('dashboard')) {
      pages.push({ id: 'dashboard', name: 'Dashboard', path: '/dashboard', components: [] });
    }
    if (text.includes('profile') || text.includes('user')) {
      pages.push({ id: 'profile', name: 'Profile', path: '/profile', components: [] });
    }
    if (text.includes('login') || text.includes('auth')) {
      pages.push({ id: 'login', name: 'Login', path: '/login', components: [] });
    }

    return pages;
  }

  private extractMockModels(idea: any): any[] {
    const models = [];
    const text = `${idea.description} ${idea.rawInput}`.toLowerCase();

    if (text.includes('user') || text.includes('account')) {
      models.push({
        name: 'User',
        fields: [
          { name: 'id', type: 'String', required: true },
          { name: 'email', type: 'String', required: true },
          { name: 'name', type: 'String', required: false },
          { name: 'createdAt', type: 'DateTime', required: true },
        ],
      });
    }

    return models;
  }

  private extractMockAPIs(idea: any): any[] {
    const apis = [];
    const text = `${idea.description} ${idea.rawInput}`.toLowerCase();

    if (text.includes('crud') || text.includes('api')) {
      apis.push({ path: '/api/items', method: 'GET' });
      apis.push({ path: '/api/items', method: 'POST' });
      apis.push({ path: '/api/items/:id', method: 'GET' });
      apis.push({ path: '/api/items/:id', method: 'PUT' });
      apis.push({ path: '/api/items/:id', method: 'DELETE' });
    }

    return apis;
  }

  private extractMockIntegrations(idea: any): any[] {
    const integrations = [];
    const text = `${idea.description} ${idea.rawInput}`.toLowerCase();

    if (text.includes('stripe') || text.includes('payment')) {
      integrations.push({ name: 'Stripe', type: 'payment' });
    }
    if (text.includes('email')) {
      integrations.push({ name: 'Email', type: 'communication' });
    }

    return integrations;
  }

  private generateMockReactComponent(): string {
    return `'use client';

import { useState } from 'react';

export default function DemoComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Demo Component</h1>
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Count: {count}
      </button>
    </div>
  );
}
`;
  }

  private generateMockAPI(): string {
    return `import { Request, Response } from 'express';

export async function demoHandler(req: Request, res: Response) {
  try {
    // [DEMO MODE] Mock API handler
    const data = { message: 'Demo response', timestamp: new Date().toISOString() };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
`;
  }

  private generateMockSchema(): string {
    return `model Demo {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

