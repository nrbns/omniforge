import axios from 'axios';
import { LLMRequest, LLMResponse, ChatRequest, LLMConfig } from '../types';

export class AnthropicProvider {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
    this.defaultModel = config.model || 'claude-3-opus-20240229';
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const messages = [{ role: 'user', content: request.prompt }];

    const response = await axios.post(
      `${this.baseUrl}/messages`,
      {
        model: this.defaultModel,
        max_tokens: request.maxTokens || 2048,
        temperature: request.temperature || 0.7,
        system: request.systemPrompt,
        messages,
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      text: response.data.content[0].text,
      model: response.data.model,
      tokensUsed: response.data.usage?.input_tokens + response.data.usage?.output_tokens,
      finishReason: response.data.stop_reason,
    };
  }

  async chat(request: ChatRequest): Promise<LLMResponse> {
    const response = await axios.post(
      `${this.baseUrl}/messages`,
      {
        model: this.defaultModel,
        messages: request.messages.map((msg) => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          content: msg.content,
        })),
        max_tokens: request.maxTokens || 2048,
        temperature: request.temperature || 0.7,
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      text: response.data.content[0].text,
      model: response.data.model,
      tokensUsed: response.data.usage?.input_tokens + response.data.usage?.output_tokens,
      finishReason: response.data.stop_reason,
    };
  }
}

