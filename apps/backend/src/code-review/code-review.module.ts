import { Module } from '@nestjs/common';
import { CodeReviewController } from './code-review.controller';
import { CodeReviewService } from './code-review.service';
import { RAGModule } from '../rag/rag.module';

@Module({
  imports: [RAGModule],
  controllers: [CodeReviewController],
  providers: [CodeReviewService],
  exports: [CodeReviewService],
})
export class CodeReviewModule {}

