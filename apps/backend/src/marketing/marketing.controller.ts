import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { ABTestingService } from './ab-testing.service';
import { CreateMarketingAssetDto } from './dto';

@ApiTags('marketing')
@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly marketingService: MarketingService,
    private readonly abTestingService: ABTestingService,
  ) {}

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

  @Post('ab-tests')
  @ApiOperation({ summary: 'Create A/B test' })
  @ApiResponse({ status: 200, description: 'A/B test created' })
  async createABTest(@Body() body: any) {
    return this.abTestingService.createTest(body);
  }

  @Post('ab-tests/:testId/assign')
  @ApiOperation({ summary: 'Assign user to A/B test variant' })
  @ApiResponse({ status: 200, description: 'Variant assigned' })
  async assignVariant(
    @Param('testId') testId: string,
    @Body() body: { userId: string },
  ) {
    const variantId = await this.abTestingService.assignVariant(testId, body.userId);
    return { variantId };
  }

  @Post('ab-tests/:testId/conversion')
  @ApiOperation({ summary: 'Track A/B test conversion' })
  @ApiResponse({ status: 200, description: 'Conversion tracked' })
  async trackConversion(
    @Param('testId') testId: string,
    @Body() body: { variantId: string; userId: string; conversionType: string },
  ) {
    await this.abTestingService.trackConversion(testId, body.variantId, body.userId, body.conversionType);
    return { success: true };
  }

  @Get('ab-tests/:testId/results')
  @ApiOperation({ summary: 'Get A/B test results' })
  @ApiResponse({ status: 200, description: 'Test results' })
  async getTestResults(@Param('testId') testId: string) {
    return this.abTestingService.getTestResults(testId);
  }
}
