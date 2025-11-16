import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { WorkflowController } from './workflow.controller';
import { PopupController } from './popup.controller';
import { BullModule } from '@nestjs/bullmq';
import { IdeaParserProcessor } from './processors/idea-parser.processor';
import { BuildProcessor } from './processors/build.processor';
import { DeployProcessor } from './processors/deploy.processor';
import { RAGModule } from '../rag/rag.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { ScaffoldModule } from '../scaffold/scaffold.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'idea-parser' }, { name: 'build' }, { name: 'deploy' }, { name: 'workflow' }),
    RAGModule,
    KnowledgeBaseModule,
    ScaffoldModule,
  ],
  controllers: [WorkflowController, PopupController],
  providers: [AgentsService, IdeaParserProcessor, BuildProcessor, DeployProcessor],
  exports: [AgentsService],
})
export class AgentsModule {}
