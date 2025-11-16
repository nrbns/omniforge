import { Module } from '@nestjs/common';
import { CodeReviewController } from './code-review.controller';
import { CodeReviewService } from './code-review.service';
import { RAGModule } from '../rag/rag.module';

@Module({
  imports: [RAGModule],
  controllers: [CodeReviewController],
  providers: [
    {
      provide: CodeReviewService,
      useFactory: (llmService: any) => {
        return new CodeReviewService(llmService);
      },
      inject: ['LLMService'],
    },
  ],
  exports: [CodeReviewService],
})
export class CodeReviewModule {}
