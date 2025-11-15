import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { BuildsService } from './builds.service';
import { ProjectsService } from '../projects/projects.service';

@ApiTags('builds')
@Controller('builds')
export class BuildsController {
  constructor(
    private readonly buildsService: BuildsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post('projects/:projectId')
  @ApiOperation({ summary: 'Start a build for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 201, description: 'Build started' })
  async startBuild(@Param('projectId') projectId: string) {
    const build = await this.buildsService.create(projectId);
    await this.buildsService.startBuild(build.id, projectId);
    return build;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get build details' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Build details' })
  async getBuild(@Param('id') id: string) {
    return this.buildsService.findOne(id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get build logs' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Build logs' })
  async getLogs(@Param('id') id: string) {
    const build = await this.buildsService.findOne(id);
    return {
      buildId: id,
      logs: build.logs ? JSON.parse(build.logs) : [],
    };
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get build task status' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Task status' })
  async getTasks(@Param('id') id: string) {
    const build = await this.buildsService.findOne(id);
    return {
      buildId: id,
      tasks: build.config?.tasks || [],
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download build output' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Download build artifact' })
  async downloadBuild(@Param('id') id: string, @Res() res: Response) {
    const build = await this.buildsService.findOne(id);
    if (build.status !== 'COMPLETED' || !build.outputPath) {
      res.status(400).json({ error: 'Build not completed or no output available' });
      return;
    }
    
    const filename = build.outputPath.split('/').pop() || `build-${id}.tar.gz`;
    res.redirect(`/api/scaffold/download/${encodeURIComponent(filename)}`);
  }
}
