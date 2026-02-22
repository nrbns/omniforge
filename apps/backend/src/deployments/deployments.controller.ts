import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DeploymentsService } from './deployments.service';
import { VercelService } from './vercel.service';
import { CreateDeploymentDto } from './dto';

@ApiTags('deployments')
@Controller('deployments')
export class DeploymentsController {
  constructor(
    private readonly deploymentsService: DeploymentsService,
    private readonly vercelService: VercelService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deployment' })
  async create(@Body() createDeploymentDto: CreateDeploymentDto) {
    return this.deploymentsService.create(createDeploymentDto);
  }

  @Post('quick')
  @ApiOperation({ summary: 'Quick deploy from builder layout (returns URL)' })
  @ApiResponse({ status: 200, description: 'Deployment URL' })
  async quickDeploy(@Body() body: { projectName?: string; layout: any }) {
    const { projectName = 'omniforge-app', layout } = body;
    return this.vercelService.deployFromLayout(projectName, layout);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deployments' })
  async findAll(@Query('projectId') projectId?: string) {
    return this.deploymentsService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deployment by ID' })
  @ApiParam({ name: 'id', description: 'Deployment ID' })
  async findOne(@Param('id') id: string) {
    return this.deploymentsService.findOne(id);
  }

  @Post(':id/rollback')
  @ApiOperation({ summary: 'Rollback deployment to previous version' })
  @ApiParam({ name: 'id', description: 'Deployment ID' })
  @ApiResponse({ status: 200, description: 'Deployment rolled back successfully' })
  async rollback(@Param('id') id: string) {
    return this.deploymentsService.rollback(id);
  }
}
