import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowMonitoringService } from './workflow-monitoring.service';
import { CreateWorkflowDto } from './dto';

@ApiTags('workflows')
@Controller('workflows')
export class WorkflowsController {
  constructor(
    private readonly workflowsService: WorkflowsService,
    private readonly executionService: WorkflowExecutionService,
    private readonly monitoringService: WorkflowMonitoringService
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a workflow for a business',
  })
  @ApiBody({ type: CreateWorkflowDto })
  @ApiResponse({ status: 201, description: 'Workflow created' })
  async create(@Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(dto);
  }

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'List workflows for a business',
  })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'List of workflows' })
  async listForBusiness(@Param('businessId') businessId: string) {
    return this.workflowsService.listForBusiness(businessId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get workflow by ID',
  })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'Workflow details' })
  async get(@Param('id') id: string) {
    return this.workflowsService.get(id);
  }

  @Post(':id/execute')
  @ApiOperation({
    summary: 'Execute a workflow',
  })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'Workflow execution started' })
  async execute(@Param('id') id: string, @Body() body: { triggerData?: Record<string, any> }) {
    const workflow = await this.workflowsService.get(id);
    await this.executionService.queueWorkflow(
      id,
      {
        id,
        nodes: (workflow.steps as any)?.nodes || [],
        edges: (workflow.steps as any)?.edges || [],
      },
      body.triggerData
    );
    return { success: true, message: 'Workflow execution queued' };
  }

  @Get(':id/monitoring')
  @ApiOperation({
    summary: 'Get workflow monitoring stats',
  })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'Monitoring stats' })
  async getMonitoring(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const dateRange =
      startDate && endDate
        ? {
            start: new Date(startDate),
            end: new Date(endDate),
          }
        : undefined;

    return this.monitoringService.getExecutionStats(id, dateRange);
  }

  @Get(':id/logs')
  @ApiOperation({
    summary: 'Get workflow execution logs',
  })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'Execution logs' })
  async getLogs(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.monitoringService.getExecutionLogs(id, parseInt(limit || '50', 10));
  }

  @Get('queue/status')
  @ApiOperation({
    summary: 'Get workflow queue status',
  })
  @ApiResponse({ status: 200, description: 'Queue status' })
  async getQueueStatus() {
    return this.monitoringService.getQueueStatus();
  }
}
