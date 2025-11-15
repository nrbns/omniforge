import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from '@omniforge/knowledge-base';
import { TemplateRetrievalService } from '@omniforge/knowledge-base';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { VectorStoreService } from '@omniforge/rag';

@Module({
  controllers: [KnowledgeBaseController],
  providers: [
    {
      provide: 'KnowledgeBaseService',
      useFactory: (vectorStore: VectorStoreService) => {
        return new KnowledgeBaseService(vectorStore);
      },
      inject: ['VectorStoreService'],
    },
    {
      provide: 'TemplateRetrievalService',
      useFactory: (kb: KnowledgeBaseService, vectorStore: VectorStoreService) => {
        return new TemplateRetrievalService(kb, vectorStore);
      },
      inject: ['KnowledgeBaseService', 'VectorStoreService'],
    },
  ],
  exports: ['KnowledgeBaseService', 'TemplateRetrievalService'],
})
export class KnowledgeBaseModule {}

