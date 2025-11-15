import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { IdeasModule } from './ideas/ideas.module';
import { ProjectsModule } from './projects/projects.module';
import { BuildsModule } from './builds/builds.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { TokensModule } from './tokens/tokens.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AgentsModule } from './agents/agents.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { HuggingFaceModule } from './huggingface/huggingface.module';
import { RAGModule } from './rag/rag.module';
import { DocumentModule } from './document/document.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { SearchModule } from './search/search.module';
import { CodeReviewModule } from './code-review/code-review.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { ScaffoldModule } from './scaffold/scaffold.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    CommonModule,
    PrismaModule,
    RedisModule,
    Neo4jModule,
    HuggingFaceModule,
    RAGModule,
    DocumentModule,
    KnowledgeBaseModule,
    SearchModule,
    CodeReviewModule,
    HealthModule,
    ScaffoldModule,
    IdeasModule,
    ProjectsModule,
    BuildsModule,
    DeploymentsModule,
    TokensModule,
    RealtimeModule,
    AgentsModule,
  ],
})
export class AppModule {}

