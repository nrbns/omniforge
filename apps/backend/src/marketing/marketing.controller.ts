import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { CreateMarketingAssetDto } from './dto';

@ApiTags('marketing')
@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a marketing asset for a business',
  })
  @ApiBody({ type: CreateMarketingAssetDto })
  @ApiResponse({ status: 201, description: 'Marketing asset created' })
  async create(@Body() dto: CreateMarketingAssetDto) {
    return this.marketingService.create(dto);
  }

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'List marketing assets for a business',
  })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'List of marketing assets' })
  async findByBusiness(@Param('businessId') businessId: string) {
    return this.marketingService.findByBusiness(businessId);
  }
}
