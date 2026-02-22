import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { InventoryService } from './inventory.service';
import { Response } from 'express';
import * as csv from 'csv-parse/sync';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly inventoryService: InventoryService
  ) {}

  @Post('products/import')
  @ApiOperation({ summary: 'Import products from CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 200, description: 'Products imported' })
  async importProducts(
    @UploadedFile() file: Express.Multer.File,
    @Body('businessId') businessId: string
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Parse CSV
    const records = csv.parse(file.buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
    });

    // Import products
    const imported = [];
    for (const record of records as Array<Record<string, string>>) {
      // TODO: Create product in database
      imported.push({
        name: record.name || record.product_name,
        price: parseFloat(record.price || '0'),
        description: record.description,
        stock: parseInt(record.stock || record.quantity || '0', 10),
      });
    }

    return {
      success: true,
      imported: imported.length,
      products: imported,
    };
  }

  @Get('products/:businessId/export')
  @ApiOperation({ summary: 'Export products to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file' })
  async exportProducts(@Param('businessId') businessId: string, @Res() res: Response) {
    // Get products from database
    const products = await this.storeService.getProducts(businessId);

    // Convert to CSV
    const csvRows = ['name,price,description,stock'];
    for (const product of products) {
      csvRows.push(
        `"${product.name}","${product.price}","${product.description || ''}","${product.stock || 0}"`
      );
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products-${businessId}.csv"`);
    res.send(csvRows.join('\n'));
  }

  @Get('inventory/low-stock/:businessId')
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiResponse({ status: 200, description: 'Low stock products' })
  async getLowStock(
    @Param('businessId') businessId: string,
    @Query('threshold') threshold: string
  ) {
    return this.inventoryService.getLowStockProducts(businessId, parseInt(threshold || '10', 10));
  }
}
