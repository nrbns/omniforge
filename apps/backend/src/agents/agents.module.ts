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
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { HuggingFaceModule } from '../huggingface/huggingface.module';
import { HallucinationDetectorService } from './services/hallucination-detector.service';
import { ErrorRecoveryService } from './services/error-recovery.service';
import { CodeAnalyzerService } from './services/code-analyzer.service';
import { ParallelExecutorService } from './services/parallel-executor.service';
import { LLMService } from '@omniforge/llm';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'idea-parser' },
      { name: 'build' },
      { name: 'deploy' },
      { name: 'workflow' }
    ),
    RAGModule,
    KnowledgeBaseModule,
    ScaffoldModule,
    PrismaModule,
    RealtimeModule,
    HuggingFaceModule,
  ],
  controllers: [WorkflowController, PopupController],
  providers: [
    AgentsService,
    IdeaParserProcessor,
    BuildProcessor,
    DeployProcessor,
    HallucinationDetectorService,
    ErrorRecoveryService,
    CodeAnalyzerService,
    ParallelExecutorService,
    {
      provide: 'LLMService',
      useFactory: () => {
        // Initialize LLMService with available providers
        const configs = [];
        if (process.env.HUGGINGFACE_API_KEY) {
          configs.push({
            provider: 'huggingface' as const,
            config: { provider: 'huggingface' as const, apiKey: process.env.HUGGINGFACE_API_KEY },
          });
        }
        if (process.env.OPENAI_API_KEY) {
          configs.push({
            provider: 'openai' as const,
            config: { provider: 'openai' as const, apiKey: process.env.OPENAI_API_KEY },
          });
        }
        return new LLMService(configs, 'huggingface');
      },
    },
  ],
  exports: [
    AgentsService,
    HallucinationDetectorService,
    ErrorRecoveryService,
    CodeAnalyzerService,
    ParallelExecutorService,
  ],
})
export class AgentsModule {}
