import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  HUGGINGFACE_MODELS,
  EmbeddingResponse,
  TextGenerationResponse,
  ClassificationResponse,
} from '@omniforge/shared';

@Injectable()
export class HuggingFaceService implements OnModuleInit {
  private readonly logger = new Logger(HuggingFaceService.name);
  private apiKey: string;
  private client: AxiosInstance;
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY') || '';
  }

  onModuleInit() {
    if (!this.apiKey) {
      this.logger.warn('Hugging Face API key not found. Some features may be limited.');
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

    this.logger.log('Hugging Face service initialized');
  }

  /**
   * Generate embeddings for semantic search
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.client) {
      throw new Error('Hugging Face API key not configured');
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
      throw error;
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
    if (!this.client) {
      throw new Error('Hugging Face API key not configured');
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
      return this.generateTextFallback(prompt);
    }
  }

  /**
   * Generate code using code generation model
   */
  async generateCode(prompt: string, language: string = 'typescript'): Promise<string> {
    if (!this.client) {
      throw new Error('Hugging Face API key not configured');
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
      throw error;
    }
  }

  /**
   * Classify text for idea categorization
   */
  async classifyText(text: string): Promise<{ label: string; score: number }> {
    if (!this.client) {
      throw new Error('Hugging Face API key not configured');
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
      throw error;
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
      throw error;
    }
  }

  /**
   * Complete code snippet
   */
  async completeCode(prefix: string, suffix?: string): Promise<string> {
    if (!this.client) {
      throw new Error('Hugging Face API key not configured');
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
      throw error;
    }
  }

  /**
   * Analyze sentiment of idea feedback
   */
  async analyzeSentiment(text: string): Promise<{ label: string; score: number }> {
    if (!this.client) {
      throw new Error('Hugging Face API key not configured');
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
      throw error;
    }
  }

  /**
   * Batch generate embeddings
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      texts.map((text) => this.generateEmbedding(text))
    );
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

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private async generateTextFallback(prompt: string): Promise<string> {
    // Simple fallback - return formatted prompt as placeholder
    this.logger.warn('Using fallback text generation');
    return `[Generated from: ${prompt.slice(0, 100)}...]`;
  }
}

