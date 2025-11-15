// HuggingFaceService should be injected via constructor, not imported
// This will be provided by the backend module
export interface HuggingFaceService {
  generateEmbedding(text: string): Promise<number[]>;
  generateEmbeddings(texts: string[]): Promise<number[][]>;
  generateText(prompt: string, maxTokens?: number, temperature?: number): Promise<string>;
}

import { LLMRequest, LLMResponse, ChatRequest } from '../types';

export class HuggingFaceProvider {
  private huggingFaceService: HuggingFaceService;

  constructor(huggingFaceService: HuggingFaceService) {
    this.huggingFaceService = huggingFaceService;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const prompt = request.systemPrompt
      ? `${request.systemPrompt}\n\n${request.prompt}`
      : request.prompt;

    const text = await this.huggingFaceService.generateText(
      prompt,
      request.maxTokens || 512,
      request.temperature || 0.7
    );

    return {
      text,
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
    };
  }

  async chat(request: ChatRequest): Promise<LLMResponse> {
    // Convert messages to prompt
    const prompt = request.messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const text = await this.huggingFaceService.generateText(
      prompt,
      request.maxTokens || 512,
      request.temperature || 0.7
    );

    return {
      text,
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
    };
  }
}
