import { Idea } from '@omniforge/shared';
import { AppSpec } from '../types';
import { RAGService } from '@omniforge/rag';
import { LLMService } from '@omniforge/llm';
import { TemplateRetrievalService } from '@omniforge/knowledge-base';

export class IdeaParserAgent {
  private ragService?: RAGService;
  private llmService?: LLMService;
  private templateRetrieval?: TemplateRetrievalService;

  constructor(
    ragService?: RAGService,
    llmService?: LLMService,
    templateRetrieval?: TemplateRetrievalService
  ) {
    this.ragService = ragService;
    this.llmService = llmService;
    this.templateRetrieval = templateRetrieval;
  }

  /**
   * Parses raw idea input and extracts structured spec using RAG + LLM
   */
  async parseIdea(idea: Idea): Promise<AppSpec> {
    const fullText = `${idea.title}\n\n${idea.description || ''}\n\n${idea.rawInput || ''}`;

    // Use RAG if available for enhanced parsing with context
    if (this.ragService && this.llmService) {
      try {
        return await this.parseWithRAG(idea, fullText);
      } catch (error) {
        console.error('RAG parsing failed, falling back to direct LLM:', error);
      }
    }

    // Use LLM directly if available
    if (this.llmService) {
      try {
        return await this.parseWithLLM(idea, fullText);
      } catch (error) {
        console.error('LLM parsing failed, falling back to heuristics:', error);
      }
    }

    // Fallback to heuristic-based parsing
    return this.parseWithHeuristics(idea);
  }

  private async parseWithRAG(idea: Idea, fullText: string): Promise<AppSpec> {
    if (!this.ragService) {
      throw new Error('RAG service not available');
    }

    // Find similar templates
    let templateContext = '';
    if (this.templateRetrieval) {
      const templateMatch = await this.templateRetrieval.getBestTemplate(fullText);
      if (templateMatch && templateMatch.similarity > 0.7) {
        templateContext = `\n\nSimilar template found: ${templateMatch.template.title}\n${templateMatch.template.content}`;
      }
    }

    // Use RAG to generate spec with context
    const response = await this.ragService.generateIdeaSpec(fullText + templateContext);
    
    if (response) {
      return {
        ...response,
        name: idea.title,
        description: idea.description || response.description || '',
        generatedAt: new Date().toISOString(),
      };
    }

    throw new Error('RAG did not return valid spec');
  }

  private async parseWithLLM(idea: Idea, fullText: string): Promise<AppSpec> {
    if (!this.llmService) {
      throw new Error('LLM service not available');
    }

    const prompt = `Parse this app idea into a structured JSON specification:

Title: ${idea.title}
Description: ${idea.description || ''}
Raw Input: ${idea.rawInput || ''}

Extract:
1. Pages with routes and components
2. Data models with fields and types
3. API endpoints needed
4. Real-time features required
5. Third-party integrations
6. UI/UX requirements

Return ONLY valid JSON:`;

    try {
      const response = await this.llmService.generate(prompt, {
        temperature: 0.3,
        maxTokens: 2048,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          name: idea.title,
          description: idea.description || parsed.description || '',
          generatedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Error parsing LLM response:', error);
    }

    throw new Error('LLM did not return valid spec');
  }

  private parseWithHeuristics(idea: Idea): AppSpec {
    const spec: AppSpec = {
      version: '1.0.0',
      name: idea.title,
      description: idea.description || '',
      pages: this.extractPages(idea),
      dataModels: this.extractDataModels(idea),
      apis: this.extractAPIs(idea),
      realtime: this.extractRealtime(idea),
      integrations: this.extractIntegrations(idea),
      ui: {
        theme: 'light',
        primaryColor: '#3b82f6',
      },
      generatedAt: new Date().toISOString(),
    };

    return spec;
  }

  private extractPages(idea: Idea): any[] {
    const pages: any[] = [
      {
        id: 'home',
        name: 'Home',
        path: '/',
        components: [],
      },
    ];

    const text = `${idea.description} ${idea.rawInput}`.toLowerCase();

    if (text.includes('dashboard') || text.includes('admin')) {
      pages.push({
        id: 'dashboard',
        name: 'Dashboard',
        path: '/dashboard',
        components: [],
      });
    }

    if (text.includes('profile') || text.includes('user') || text.includes('account')) {
      pages.push({
        id: 'profile',
        name: 'Profile',
        path: '/profile',
        components: [],
      });
    }

    if (text.includes('login') || text.includes('sign in') || text.includes('auth')) {
      pages.push({
        id: 'login',
        name: 'Login',
        path: '/login',
        components: [],
      });
    }

    if (text.includes('settings') || text.includes('preferences')) {
      pages.push({
        id: 'settings',
        name: 'Settings',
        path: '/settings',
        components: [],
      });
    }

    return pages;
  }

  private extractDataModels(idea: Idea): any[] {
    const models: any[] = [];
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

    if (text.includes('post') || text.includes('article') || text.includes('content')) {
      models.push({
        name: 'Post',
        fields: [
          { name: 'id', type: 'String', required: true },
          { name: 'title', type: 'String', required: true },
          { name: 'content', type: 'String', required: true },
          { name: 'authorId', type: 'String', required: true },
          { name: 'createdAt', type: 'DateTime', required: true },
        ],
      });
    }

    return models;
  }

  private extractAPIs(idea: Idea): any[] {
    const apis: any[] = [];
    const text = `${idea.description} ${idea.rawInput}`.toLowerCase();

    if (text.includes('crud') || text.includes('create') || text.includes('delete')) {
      apis.push({ path: '/api/items', method: 'GET' });
      apis.push({ path: '/api/items', method: 'POST' });
      apis.push({ path: '/api/items/:id', method: 'GET' });
      apis.push({ path: '/api/items/:id', method: 'PUT' });
      apis.push({ path: '/api/items/:id', method: 'DELETE' });
    }

    return apis;
  }

  private extractRealtime(idea: Idea): any[] {
    const realtime: any[] = [];
    const text = `${idea.description} ${idea.rawInput}`.toLowerCase();

    if (text.includes('real-time') || text.includes('live') || text.includes('chat') || text.includes('notification')) {
      realtime.push({
        channel: 'updates',
        events: ['update', 'notification'],
      });
    }

    return realtime;
  }

  private extractIntegrations(idea: Idea): any[] {
    const integrations: any[] = [];
    const text = `${idea.description} ${idea.rawInput}`.toLowerCase();

    if (text.includes('stripe') || text.includes('payment')) {
      integrations.push({ name: 'Stripe', type: 'payment' });
    }

    if (text.includes('email') || text.includes('sendgrid') || text.includes('mailgun')) {
      integrations.push({ name: 'Email', type: 'communication' });
    }

    if (text.includes('oauth') || text.includes('google') || text.includes('github')) {
      integrations.push({ name: 'OAuth', type: 'authentication' });
    }

    return integrations;
  }
}
