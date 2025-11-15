import { Module } from '@nestjs/common';
import { IdeasController } from './ideas.controller';
import { IdeasService } from './ideas.service';
import { AgentsModule } from '../agents/agents.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [AgentsModule, RealtimeModule],
  controllers: [IdeasController],
  providers: [IdeasService],
  exports: [IdeasService],
})
export class IdeasModule {}

