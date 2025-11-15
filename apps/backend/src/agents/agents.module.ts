import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { BullModule } from '@nestjs/bullmq';
import { IdeaParserProcessor } from './processors/idea-parser.processor';
import { BuildProcessor } from './processors/build.processor';
import { DeployProcessor } from './processors/deploy.processor';
import { RAGModule } from '../rag/rag.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { ScaffoldModule } from '../scaffold/scaffold.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'idea-parser' },
      { name: 'build' },
      { name: 'deploy' },
    ),
    RAGModule,
    KnowledgeBaseModule,
    ScaffoldModule,
  ],
  providers: [
    AgentsService,
    IdeaParserProcessor,
    BuildProcessor,
    DeployProcessor,
  ],
  exports: [AgentsService],
})
export class AgentsModule {}
