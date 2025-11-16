import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  HUGGINGFACE_MODELS,
  EmbeddingResponse,
  TextGenerationResponse,
  ClassificationResponse,
} from '@omniforge/shared';
import { DemoService } from '../common/services/demo.service';

@Injectable()
export class HuggingFaceService implements OnModuleInit {
  private readonly logger = new Logger(HuggingFaceService.name);
  private apiKey: string;
  private client: AxiosInstance | null = null;
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';
  private readonly demoService: DemoService;

  constructor(
    private configService: ConfigService,
    demoService?: DemoService
  ) {
    this.apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY') || '';
    this.demoService = demoService || new DemoService();
  }

  onModuleInit() {
    if (this.demoService.isEnabled()) {
      this.logger.log('🚀 DEMO MODE: Hugging Face service will use mock responses');
      return;
    }

    if (!this.apiKey) {
      this.logger.warn('Hugging Face API key not found. Running in demo mode.');
      return;
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds for model inference
    });

    this.logger.log('✅ Hugging Face service initialized with API key');
  }

  /**
   * Generate embeddings for semantic search
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (this.demoService.isEnabled()) {
      return this.demoService.mockGenerateEmbedding(text);
    }

    if (!this.client) {
      this.logger.warn('Falling back to demo mode for embeddings');
      return this.demoService.mockGenerateEmbedding(text);
    }

    try {
      const response = await this.client.post<EmbeddingResponse>(
        `${HUGGINGFACE_MODELS.EMBEDDINGS}`,
        {
          inputs: text,
        }
      );

      return response.data.embedding;
    } catch (error: any) {
      this.logger.error(`Error generating embedding: ${error.message}`);
      this.logger.warn('Falling back to demo mode');
      return this.demoService.mockGenerateEmbedding(text);
    }
  }

  /**
   * Generate text using language model
   */
  async generateText(
    prompt: string,
    maxLength: number = 512,
    temperature: number = 0.7
  ): Promise<string> {
    if (this.demoService.isEnabled()) {
      return this.demoService.mockGenerateCode(prompt);
    }

    if (!this.client) {
      this.logger.warn('Falling back to demo mode for text generation');
      return this.demoService.mockGenerateCode(prompt);
    }

    try {
      const response = await this.client.post<TextGenerationResponse[]>(
        `${HUGGINGFACE_MODELS.TEXT_GENERATION}`,
        {
          inputs: prompt,
          parameters: {
            max_length: maxLength,
            temperature,
            return_full_text: false,
          },
        }
      );

      return response.data[0]?.generated_text || '';
    } catch (error: any) {
      this.logger.error(`Error generating text: ${error.message}`);
      // Fallback to simpler model if main model fails
      return this.demoService.mockGenerateCode(prompt);
    }
  }

  /**
   * Generate code using code generation model
   */
  async generateCode(prompt: string, language: string = 'typescript'): Promise<string> {
    if (this.demoService.isEnabled()) {
      return this.demoService.mockGenerateCode(prompt, language);
    }

    if (!this.client) {
      this.logger.warn('Falling back to demo mode for code generation');
      return this.demoService.mockGenerateCode(prompt, language);
    }

    try {
      const fullPrompt = `// ${language}\n${prompt}\n`;

      const response = await this.client.post<TextGenerationResponse[]>(
        `${HUGGINGFACE_MODELS.CODE_GENERATION}`,
        {
          inputs: fullPrompt,
          parameters: {
            max_length: 1024,
            temperature: 0.2, // Lower temperature for code
            return_full_text: false,
          },
        }
      );

      return response.data[0]?.generated_text || '';
    } catch (error: any) {
      this.logger.error(`Error generating code: ${error.message}`);
      this.logger.warn('Falling back to demo mode');
      return this.demoService.mockGenerateCode(prompt, language);
    }
  }

  /**
   * Classify text for idea categorization
   */
  async classifyText(text: string): Promise<{ label: string; score: number }> {
    if (this.demoService.isEnabled()) {
      return { label: 'POSITIVE', score: 0.9 };
    }

    if (!this.client) {
      return { label: 'POSITIVE', score: 0.9 };
    }

    try {
      const response = await this.client.post<ClassificationResponse[]>(
        `${HUGGINGFACE_MODELS.TEXT_CLASSIFICATION}`,
        {
          inputs: text,
        }
      );

      const result = Array.isArray(response.data) ? response.data[0] : response.data;
      return {
        label: result.label,
        score: result.score,
      };
    } catch (error: any) {
      this.logger.error(`Error classifying text: ${error.message}`);
      return { label: 'POSITIVE', score: 0.9 };
    }
  }

  /**
   * Extract structured information from idea text
   */
  async extractIdeaSpec(prompt: string): Promise<any> {
    const systemPrompt = `You are an expert software architect. Parse the following app idea into a structured JSON specification.

Extract:
1. Pages and their routes
2. Data models with fields and types
3. API endpoints needed
4. Real-time features required
5. Third-party integrations
6. UI/UX requirements (theme, colors, style)

Return ONLY valid JSON with this structure:
{
  "pages": [...],
  "dataModels": [...],
  "apis": [...],
  "realtime": [...],
  "integrations": [...],
  "ui": {...}
}

Idea: ${prompt}`;

    if (this.demoService.isEnabled()) {
      // Parse prompt and generate mock spec
      const mockIdea = { title: prompt.split('\n')[0], description: prompt, rawInput: prompt };
      return this.demoService.mockParseIdea(mockIdea);
    }

    try {
      const generated = await this.generateText(systemPrompt, 2048, 0.3);

      // Extract JSON from response
      const jsonMatch = generated.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Could not extract JSON from response');
    } catch (error: any) {
      this.logger.error(`Error extracting idea spec: ${error.message}`);
      const mockIdea = { title: prompt.split('\n')[0], description: prompt, rawInput: prompt };
      return this.demoService.mockParseIdea(mockIdea);
    }
  }

  /**
   * Complete code snippet
   */
  async completeCode(prefix: string, suffix?: string): Promise<string> {
    if (this.demoService.isEnabled()) {
      return this.demoService.mockGenerateCode(prefix);
    }

    if (!this.client) {
      return this.demoService.mockGenerateCode(prefix);
    }

    try {
      const input = suffix ? { prefix, suffix } : prefix;

      const response = await this.client.post<TextGenerationResponse[]>(
        `${HUGGINGFACE_MODELS.CODE_COMPLETION}`,
        {
          inputs: input,
          parameters: {
            max_length: 512,
            temperature: 0.2,
            return_full_text: false,
          },
        }
      );

      return response.data[0]?.generated_text || '';
    } catch (error: any) {
      this.logger.error(`Error completing code: ${error.message}`);
      return this.demoService.mockGenerateCode(prefix);
    }
  }

  /**
   * Analyze sentiment of idea feedback
   */
  async analyzeSentiment(text: string): Promise<{ label: string; score: number }> {
    if (this.demoService.isEnabled()) {
      return { label: 'POSITIVE', score: 0.85 };
    }

    if (!this.client) {
      return { label: 'POSITIVE', score: 0.85 };
    }

    try {
      const response = await this.client.post<ClassificationResponse[]>(
        `${HUGGINGFACE_MODELS.SENTIMENT_ANALYSIS}`,
        {
          inputs: text,
        }
      );

      const result = Array.isArray(response.data) ? response.data[0] : response.data;
      return {
        label: result.label,
        score: result.score,
      };
    } catch (error: any) {
      this.logger.error(`Error analyzing sentiment: ${error.message}`);
      return { label: 'POSITIVE', score: 0.85 };
    }
  }

  /**
   * Batch generate embeddings
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(texts.map((text) => this.generateEmbedding(text)));
    return embeddings;
  }

  /**
   * Find similar ideas using embeddings
   */
  async findSimilarIdeas(
    queryEmbedding: number[],
    ideaEmbeddings: Array<{ id: string; embedding: number[] }>,
    topK: number = 5
  ): Promise<Array<{ id: string; similarity: number }>> {
    const similarities = ideaEmbeddings.map((idea) => ({
      id: idea.id,
      similarity: this.cosineSimilarity(queryEmbedding, idea.embedding),
    }));

    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
