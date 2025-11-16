import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateFunnelDto } from './dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('funnels')
  @ApiOperation({
    summary: 'Create a sales funnel for a business',
  })
  @ApiBody({ type: CreateFunnelDto })
  @ApiResponse({ status: 201, description: 'Sales funnel created' })
  async createFunnel(@Body() dto: CreateFunnelDto) {
    return this.salesService.createFunnel(dto);
  }

  @Get('business/:businessId/funnels')
  @ApiOperation({
    summary: 'List sales funnels for a business',
  })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'List of sales funnels' })
  async listFunnels(@Param('businessId') businessId: string) {
    return this.salesService.listFunnels(businessId);
  }

  @Get('funnels/:id')
  @ApiOperation({
    summary: 'Get a sales funnel by ID',
  })
  @ApiParam({ name: 'id', description: 'Funnel ID' })
  @ApiResponse({ status: 200, description: 'Funnel details' })
  async getFunnel(@Param('id') id: string) {
    return this.salesService.getFunnel(id);
  }
}
