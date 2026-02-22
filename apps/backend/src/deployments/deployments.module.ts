import { Module } from '@nestjs/common';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';
import { VercelService } from './vercel.service';
import { AgentsModule } from '../agents/agents.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [AgentsModule, RealtimeModule],
  controllers: [DeploymentsController],
  providers: [DeploymentsService, VercelService],
  exports: [DeploymentsService],
})
export class DeploymentsModule {}
