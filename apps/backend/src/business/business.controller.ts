import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto';

@ApiTags('business')
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post(':projectId')
  @ApiOperation({
    summary: 'Create or update business metadata for a project',
  })
  @ApiParam({ name: 'projectId', description: 'Associated project ID' })
  @ApiBody({ type: CreateBusinessDto })
  @ApiResponse({ status: 200, description: 'Business upserted successfully' })
  async upsertForProject(@Param('projectId') projectId: string, @Body() dto: CreateBusinessDto) {
    return this.businessService.upsertForProject(projectId, {
      ...dto,
      projectId,
    });
  }

  @Get('project/:projectId')
  @ApiOperation({
    summary: 'Get business details for a project',
  })
  @ApiParam({ name: 'projectId', description: 'Associated project ID' })
  @ApiResponse({ status: 200, description: 'Business details' })
  async findByProject(@Param('projectId') projectId: string) {
    return this.businessService.findByProject(projectId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update business metadata by ID',
  })
  @ApiParam({ name: 'id', description: 'Business ID' })
  @ApiBody({ type: UpdateBusinessDto })
  @ApiResponse({ status: 200, description: 'Business updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateBusinessDto) {
    return this.businessService.update(id, dto);
  }
}
