import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';

@ApiTags('agents')
@Controller('agents')
export class WorkflowController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('workflow')
  @ApiOperation({ summary: 'Generate AI-suggested workflow' })
  @ApiResponse({ status: 200, description: 'Workflow generated successfully' })
  async generateWorkflow(@Body() body: { prompt: string; ideaId?: string }) {
    // Generate workflow nodes using AI
    const workflow = await this.agentsService.generateWorkflow(body.prompt, body.ideaId);

    return {
      nodes: workflow.nodes,
      edges: workflow.edges,
      metadata: workflow.metadata,
    };
  }
}
