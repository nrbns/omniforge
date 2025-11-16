import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a lead (public endpoint for forms)',
  })
  @ApiBody({ type: CreateLeadDto })
  @ApiResponse({ status: 201, description: 'Lead created' })
  async create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'List leads for a business (through funnels)',
  })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'List of leads' })
  async listForBusiness(@Param('businessId') businessId: string) {
    return this.leadsService.listForBusiness(businessId);
  }

  @Get('funnel/:funnelId')
  @ApiOperation({
    summary: 'List leads for a sales funnel',
  })
  @ApiParam({ name: 'funnelId', description: 'Funnel ID' })
  @ApiResponse({ status: 200, description: 'List of leads for funnel' })
  async listForFunnel(@Param('funnelId') funnelId: string) {
    return this.leadsService.listForFunnel(funnelId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a lead by ID',
  })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Lead details' })
  async get(@Param('id') id: string) {
    return this.leadsService.get(id);
  }
}
