import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
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
import { BusinessModule } from './business/business.module';
import { MarketingModule } from './marketing/marketing.module';
import { SalesModule } from './sales/sales.module';
import { CrmModule } from './crm/crm.module';
import { StoreModule } from './store/store.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { LeadsModule } from './leads/leads.module';
import { StripeModule } from './integrations/stripe/stripe.module';
import { EmailModule } from './email/email.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ExportModule } from './export/export.module';
import { MetricsModule } from './metrics/metrics.module';
import { BillingModule } from './billing/billing.module';
import { PayPalModule } from './integrations/paypal/paypal.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
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
    BusinessModule,
    MarketingModule,
    SalesModule,
    CrmModule,
    StoreModule,
    WorkflowsModule,
    LeadsModule,
    StripeModule,
    EmailModule,
    AnalyticsModule,
    ExportModule,
    MetricsModule,
    BillingModule,
    PayPalModule,
    WebhooksModule,
    IdeasModule,
    ProjectsModule,
    BuildsModule,
    DeploymentsModule,
    TokensModule,
    RealtimeModule,
    AgentsModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Protect all routes by default
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
