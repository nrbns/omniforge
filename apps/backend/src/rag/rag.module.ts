import { Module, Global } from '@nestjs/common';
import { RAGService } from '@omniforge/rag';
import { RetrievalService } from '@omniforge/rag';
import { VectorStoreService } from '@omniforge/rag';
import { ContextManagerService } from '@omniforge/rag';
import { HuggingFaceService } from '../huggingface/huggingface.service';
import { LLMService } from '@omniforge/llm';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'VectorStoreService',
      useFactory: (config: ConfigService, huggingFace: HuggingFaceService) => {
        return new VectorStoreService(
          config.get<string>('QDRANT_URL') || 'http://localhost:6333',
          config.get<string>('QDRANT_API_KEY'),
          huggingFace
        );
      },
      inject: [ConfigService, HuggingFaceService],
    },
    {
      provide: 'RetrievalService',
      useFactory: (vectorStore: VectorStoreService, huggingFace: HuggingFaceService) => {
        return new RetrievalService(vectorStore, huggingFace);
      },
      inject: ['VectorStoreService', HuggingFaceService],
    },
    {
      provide: 'LLMService',
      useFactory: (config: ConfigService, huggingFace: HuggingFaceService) => {
        const providers = [];
        
        // OpenAI
        if (config.get<string>('OPENAI_API_KEY')) {
          providers.push({
            provider: 'openai' as const,
            config: {
              provider: 'openai' as const,
              apiKey: config.get<string>('OPENAI_API_KEY')!,
              model: 'gpt-4-turbo-preview',
            },
          });
        }

        // Anthropic
        if (config.get<string>('ANTHROPIC_API_KEY')) {
          providers.push({
            provider: 'anthropic' as const,
            config: {
              provider: 'anthropic' as const,
              apiKey: config.get<string>('ANTHROPIC_API_KEY')!,
              model: 'claude-3-opus-20240229',
            },
          });
        }

        const llmService = new LLMService(providers, providers[0]?.provider);
        
        // Add Hugging Face provider
        const hfProvider = new (require('@omniforge/llm').HuggingFaceProvider)(huggingFace);
        llmService.setHuggingFaceProvider(hfProvider);

        return llmService;
      },
      inject: [ConfigService, HuggingFaceService],
    },
    {
      provide: 'RAGService',
      useFactory: (retrieval: RetrievalService, llm: LLMService) => {
        return new RAGService(retrieval, llm);
      },
      inject: ['RetrievalService', 'LLMService'],
    },
    {
      provide: 'ContextManagerService',
      useFactory: () => {
        return new ContextManagerService();
      },
    },
  ],
  exports: ['RAGService', 'RetrievalService', 'LLMService', 'VectorStoreService', 'ContextManagerService'],
})
export class RAGModule {}

