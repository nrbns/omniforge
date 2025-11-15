import axios from 'axios';
import { LLMRequest, LLMResponse, ChatRequest, LLMConfig } from '../types';

export class OpenAIProvider {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.defaultModel = config.model || 'gpt-4-turbo-preview';
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const messages = [];
    
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    
    messages.push({ role: 'user', content: request.prompt });

    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.defaultModel,
        messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048,
        stop: request.stopSequences,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      text: response.data.choices[0].message.content,
      model: response.data.model,
      tokensUsed: response.data.usage?.total_tokens,
      finishReason: response.data.choices[0].finish_reason,
    };
  }

  async chat(request: ChatRequest): Promise<LLMResponse> {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.defaultModel,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048,
        stream: request.stream || false,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      text: response.data.choices[0].message.content,
      model: response.data.model,
      tokensUsed: response.data.usage?.total_tokens,
      finishReason: response.data.choices[0].finish_reason,
    };
  }
}

