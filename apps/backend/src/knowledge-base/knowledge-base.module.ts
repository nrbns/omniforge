import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from '@omniforge/knowledge-base';
import { TemplateRetrievalService } from '@omniforge/knowledge-base';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { RAGModule } from '../rag/rag.module';

@Module({
  imports: [RAGModule],
  controllers: [KnowledgeBaseController],
  providers: [
    {
      provide: 'KnowledgeBaseService',
      useFactory: (vectorStore: any) => {
        return new KnowledgeBaseService(vectorStore);
      },
      inject: ['VectorStoreService'],
    },
    {
      provide: 'TemplateRetrievalService',
      useFactory: (kb: KnowledgeBaseService, vectorStore: any) => {
        return new TemplateRetrievalService(kb, vectorStore);
      },
      inject: ['KnowledgeBaseService', 'VectorStoreService'],
    },
  ],
  exports: ['KnowledgeBaseService', 'TemplateRetrievalService'],
})
export class KnowledgeBaseModule {}
