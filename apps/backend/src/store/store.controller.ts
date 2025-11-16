import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { UpsertStoreDto, CreateProductDto } from './dto';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @ApiOperation({
    summary: 'Create or update store for a business',
  })
  @ApiBody({ type: UpsertStoreDto })
  @ApiResponse({ status: 200, description: 'Store upserted successfully' })
  async upsertStore(@Body() dto: UpsertStoreDto) {
    return this.storeService.upsertStore(dto);
  }

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'Get store for a business',
  })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'Store details' })
  async getStoreForBusiness(@Param('businessId') businessId: string) {
    return this.storeService.getStoreForBusiness(businessId);
  }

  @Post('products')
  @ApiOperation({
    summary: 'Create a product in a store',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.storeService.createProduct(dto);
  }

  @Get('products/store/:storeId')
  @ApiOperation({
    summary: 'List products for a store',
  })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async listProducts(@Param('storeId') storeId: string) {
    return this.storeService.listProducts(storeId);
  }

  @Get('orders/store/:storeId')
  @ApiOperation({
    summary: 'List orders for a store',
  })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async listOrders(@Param('storeId') storeId: string) {
    return this.storeService.listOrders(storeId);
  }
}
