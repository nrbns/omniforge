import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create project from idea' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List projects' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async list(@Query('orgId') orgId?: string, @Query('userId') userId?: string) {
    return this.projectsService.list(orgId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project details' })
  async get(@Param('id') id: string) {
    return this.projectsService.get(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  async delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  @Post(':id/hotpatch')
  @ApiOperation({ summary: 'Hot patch project (apply changes without rebuild)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Changes applied' })
  async hotPatch(@Param('id') id: string, @Body() body: { content?: any; tokens?: any }) {
    return this.projectsService.hotPatch(id, body);
  }

  @Post(':id/commit')
  @ApiOperation({ summary: 'Commit visual editor changes' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Changes committed' })
  async commit(@Param('id') id: string, @Body() body: { message: string; tokens?: any; content?: any }) {
    return this.projectsService.commitChanges(id, body);
  }
}
