import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowMonitoringService } from './workflow-monitoring.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailModule } from '../email/email.module';
import { StripeModule } from '../integrations/stripe/stripe.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: 'workflow' }),
    EmailModule,
    StripeModule,
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowExecutionService, WorkflowMonitoringService],
  exports: [WorkflowsService, WorkflowExecutionService, WorkflowMonitoringService],
})
export class WorkflowsModule {}
