import { Controller, Get, Post, Param, Query, Body, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { Response } from 'express';

@ApiTags('export')
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('shopify/:businessId')
  @ApiOperation({ summary: 'Export products to Shopify' })
  @ApiResponse({ status: 200, description: 'Products exported to Shopify format' })
  async exportToShopify(
    @Param('businessId') businessId: string,
    @Body() body?: { apiKey?: string; store?: string },
  ) {
    return this.exportService.exportToShopify(businessId, body?.apiKey, body?.store);
  }

  @Post('hubspot/:businessId')
  @ApiOperation({ summary: 'Export contacts to HubSpot' })
  @ApiResponse({ status: 200, description: 'Contacts exported to HubSpot format' })
  async exportToHubSpot(
    @Param('businessId') businessId: string,
    @Body() body?: { apiKey?: string },
  ) {
    return this.exportService.exportToHubSpot(businessId, body?.apiKey);
  }

  @Get('csv/:businessId/:type')
  @ApiOperation({ summary: 'Export to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file' })
  async exportToCSV(
    @Param('businessId') businessId: string,
    @Param('type') type: 'products' | 'contacts' | 'orders',
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportToCSV(businessId, type);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-${businessId}.csv"`);
    res.send(csv);
  }

  @Get('json/:businessId/:type')
  @ApiOperation({ summary: 'Export to JSON' })
  @ApiResponse({ status: 200, description: 'JSON data' })
  async exportToJSON(
    @Param('businessId') businessId: string,
    @Param('type') type: 'products' | 'contacts' | 'orders',
  ) {
    return this.exportService.exportToJSON(businessId, type);
  }
}

