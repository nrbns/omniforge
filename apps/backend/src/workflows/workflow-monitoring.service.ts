import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WorkflowMonitoringService {
  private readonly logger = new Logger(WorkflowMonitoringService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('workflow') private workflowQueue: Queue,
  ) {}

  /**
   * Get workflow execution stats
   */
  async getExecutionStats(workflowId: string, dateRange?: { start: Date; end: Date }) {
    const start = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = dateRange?.end || new Date();

    const stats = await this.prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_executions,
        COUNT(CASE WHEN "status" = 'success' THEN 1 END) as successful,
        COUNT(CASE WHEN "status" = 'failed' THEN 1 END) as failed,
        AVG("duration") as avg_duration,
        MIN("duration") as min_duration,
        MAX("duration") as max_duration
      FROM "WorkflowExecution"
      WHERE "workflowId" = ${workflowId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    `.catch(() => ({
      total_executions: 0,
      successful: 0,
      failed: 0,
      avg_duration: 0,
      min_duration: 0,
      max_duration: 0,
    }));

    return {
      workflowId,
      period: { start, end },
      ...(stats as any)[0],
      successRate:
        Number((stats as any)[0]?.total_executions || 0) > 0
          ? Number((stats as any)[0]?.successful || 0) / Number((stats as any)[0]?.total_executions || 0)
          : 0,
    };
  }

  /**
   * Get workflow execution logs
   */
  async getExecutionLogs(workflowId: string, limit: number = 50) {
    const logs = await this.prisma.$queryRaw`
      SELECT *
      FROM "WorkflowExecution"
      WHERE "workflowId" = ${workflowId}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `.catch(() => []);

    return logs;
  }

  /**
   * Get queue status
   */
  async getQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.workflowQueue.getWaitingCount(),
      this.workflowQueue.getActiveCount(),
      this.workflowQueue.getCompletedCount(),
      this.workflowQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed,
    };
  }

  /**
   * Retry failed execution
   */
  async retryExecution(executionId: string): Promise<void> {
    // TODO: Retry failed workflow execution
    this.logger.log(`Retrying execution ${executionId}`);
  }
}

