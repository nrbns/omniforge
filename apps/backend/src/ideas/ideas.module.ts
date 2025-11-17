import { Module, forwardRef } from '@nestjs/common';
import { IdeasController } from './ideas.controller';
import { IdeasService } from './ideas.service';
import { IdeasSearchService } from './ideas-search.service';
import { AgentsModule } from '../agents/agents.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { PrismaModule } from '../prisma/prisma.module';
import { Neo4jModule } from '../neo4j/neo4j.module';
import { HuggingFaceModule } from '../huggingface/huggingface.module';

@Module({
  imports: [
    PrismaModule,
    AgentsModule,
    forwardRef(() => RealtimeModule),
    Neo4jModule,
    HuggingFaceModule,
  ],
  controllers: [IdeasController],
  providers: [IdeasService, IdeasSearchService],
  exports: [IdeasService, IdeasSearchService],
})
export class IdeasModule {}
