import { LLMProvider, LLMRequest, LLMResponse, ChatRequest, LLMConfig } from './types';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { HuggingFaceProvider } from './providers/huggingface.provider';

export class LLMService {
  private providers: Map<LLMProvider, any> = new Map();
  private defaultProvider: LLMProvider;
  private fallbackProvider?: LLMProvider;

  constructor(configs: Array<{ provider: LLMProvider; config: LLMConfig }>, defaultProvider?: LLMProvider) {
    configs.forEach(({ provider, config }) => {
      switch (provider) {
        case 'openai':
          this.providers.set(provider, new OpenAIProvider(config));
          break;
        case 'anthropic':
          this.providers.set(provider, new AnthropicProvider(config));
          break;
        case 'huggingface':
          // HuggingFaceProvider needs special initialization
          break;
      }
    });

    this.defaultProvider = defaultProvider || configs[0]?.provider || 'huggingface';
    this.fallbackProvider = configs.length > 1 ? configs[1]?.provider : undefined;
  }

  /**
   * Set Hugging Face provider
   */
  setHuggingFaceProvider(provider: HuggingFaceProvider): void {
    this.providers.set('huggingface', provider);
  }

  /**
   * Generate text using LLM
   */
  async generate(
    prompt: string,
    options: {
      provider?: LLMProvider;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    const provider = options.provider || this.defaultProvider;
    const llmProvider = this.providers.get(provider);

    if (!llmProvider) {
      // Fallback to alternative provider
      if (this.fallbackProvider) {
        return this.generateWithFallback(prompt, options);
      }
      throw new Error(`LLM provider ${provider} not available`);
    }

    try {
      const request: LLMRequest = {
        prompt,
        systemPrompt: options.systemPrompt,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      };

      const response = await llmProvider.generate(request);
      return response.text;
    } catch (error: any) {
      // Error logged by caller
      
      // Try fallback
      if (this.fallbackProvider && provider !== this.fallbackProvider) {
        return this.generateWithFallback(prompt, options);
      }
      
      throw error;
    }
  }

  /**
   * Generate with fallback provider
   */
  private async generateWithFallback(
    prompt: string,
    options: any
  ): Promise<string> {
    if (!this.fallbackProvider) {
      throw new Error('No fallback provider available');
    }

    const fallback = this.providers.get(this.fallbackProvider);
    if (!fallback) {
      throw new Error(`Fallback provider ${this.fallbackProvider} not available`);
    }

    // Falling back to alternative provider
    
    const request: LLMRequest = {
      prompt,
      systemPrompt: options.systemPrompt,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    };

    const response = await fallback.generate(request);
    return response.text;
  }

  /**
   * Chat completion
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options: {
      provider?: LLMProvider;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    const provider = options.provider || this.defaultProvider;
    const llmProvider = this.providers.get(provider);

    if (!llmProvider) {
      throw new Error(`LLM provider ${provider} not available`);
    }

    try {
      const request: ChatRequest = {
        messages: messages as any,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      };

      const response = await llmProvider.chat(request);
      return response.text;
    } catch (error: any) {
      // Error logged by caller
      
      // Try fallback
      if (this.fallbackProvider && provider !== this.fallbackProvider) {
        return this.chatWithFallback(messages, options);
      }
      
      throw error;
    }
  }

  /**
   * Chat with fallback
   */
  private async chatWithFallback(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options: any
  ): Promise<string> {
    if (!this.fallbackProvider) {
      throw new Error('No fallback provider available');
    }

    const fallback = this.providers.get(this.fallbackProvider);
    if (!fallback) {
      throw new Error(`Fallback provider ${this.fallbackProvider} not available`);
    }

    const request: ChatRequest = {
      messages: messages as any,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    };

    const response = await fallback.chat(request);
    return response.text;
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): LLMProvider[] {
    return Array.from(this.providers.keys());
  }
}

