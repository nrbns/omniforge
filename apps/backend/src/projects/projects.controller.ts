import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, BuildProjectDto } from './dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  async findAll(@Query('userId') userId?: string, @Query('ideaId') ideaId?: string) {
    return this.projectsService.findAll(userId, ideaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Post(':id/build')
  async build(@Param('id') id: string, @Body() buildDto: BuildProjectDto) {
    return this.projectsService.build(id, buildDto);
  }
}

