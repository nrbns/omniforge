import { Controller, Get, Param, Query } from '@nestjs/common';
import { BuildsService } from './builds.service';

@Controller('builds')
export class BuildsController {
  constructor(private readonly buildsService: BuildsService) {}

  @Get()
  async findAll(@Query('projectId') projectId?: string) {
    return this.buildsService.findAll(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.buildsService.findOne(id);
  }

  @Get(':id/logs')
  async getLogs(@Param('id') id: string) {
    return this.buildsService.getLogs(id);
  }
}

