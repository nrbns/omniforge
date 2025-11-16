import { Controller, Get, Post, Param, Query, Body, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { ExportTemplatesService } from './export-templates.service';
import { Response } from 'express';

@ApiTags('export')
@Controller('export')
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly templatesService: ExportTemplatesService,
  ) {}

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

  @Post('figma/:businessId')
  @ApiOperation({ summary: 'Export design tokens to Figma' })
  @ApiResponse({ status: 200, description: 'Figma variables JSON' })
  async exportToFigma(
    @Param('businessId') businessId: string,
    @Body() body?: { apiKey?: string; fileKey?: string },
  ) {
    return this.templatesService.exportToFigma(businessId, body?.apiKey, body?.fileKey);
  }

  @Get('shopify-template/:businessId')
  @ApiOperation({ summary: 'Export Shopify Liquid template' })
  @ApiResponse({ status: 200, description: 'Shopify template code' })
  async exportShopifyTemplate(
    @Param('businessId') businessId: string,
    @Res() res: Response,
  ) {
    const template = await this.templatesService.exportProductsToShopifyTemplate(businessId);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="shopify-template-${businessId}.liquid"`);
    res.send(template);
  }

  @Get('nextjs-template/:businessId')
  @ApiOperation({ summary: 'Export Next.js template' })
  @ApiResponse({ status: 200, description: 'Next.js template files' })
  async exportNextJSTemplate(@Param('businessId') businessId: string) {
    return this.templatesService.exportToNextJSTemplate(businessId);
  }

  @Get('react-template/:businessId')
  @ApiOperation({ summary: 'Export React template' })
  @ApiResponse({ status: 200, description: 'React template files' })
  async exportReactTemplate(@Param('businessId') businessId: string) {
    return this.templatesService.exportToReactTemplate(businessId);
  }
}

