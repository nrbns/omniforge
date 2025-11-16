import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { RAGModule } from '../rag/rag.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [RAGModule, PrismaModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
