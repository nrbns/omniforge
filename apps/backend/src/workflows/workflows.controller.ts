import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { CreateWorkflowDto } from './dto';

@ApiTags('workflows')
@Controller('workflows')
export class WorkflowsController {
  constructor(
    private readonly workflowsService: WorkflowsService,
    private readonly executionService: WorkflowExecutionService,
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
  async execute(
    @Param('id') id: string,
    @Body() body: { triggerData?: Record<string, any> },
  ) {
    const workflow = await this.workflowsService.get(id);
    await this.executionService.queueWorkflow(
      id,
      {
        id,
        nodes: (workflow.steps as any)?.nodes || [],
        edges: (workflow.steps as any)?.edges || [],
      },
      body.triggerData,
    );
    return { success: true, message: 'Workflow execution queued' };
  }
}
