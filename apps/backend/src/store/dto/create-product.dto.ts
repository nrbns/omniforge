import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Store ID this product belongs to',
  })
  storeId!: string;

  @ApiProperty({
    description: 'Product name',
  })
  name!: string;

  @ApiProperty({
    description: 'Product description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'SKU',
    required: false,
  })
  sku?: string;

  @ApiProperty({
    description: 'Price',
    example: 29.99,
  })
  price!: number;

  @ApiProperty({
    description: 'Compare-at price (original price)',
    required: false,
  })
  comparePrice?: number;

  @ApiProperty({
    description: 'Inventory quantity (null for unlimited)',
    required: false,
  })
  inventory?: number | null;

  @ApiProperty({
    description: 'Image URLs',
    required: false,
    type: [String],
  })
  images?: string[];

  @ApiProperty({
    description: 'Variant configuration',
    required: false,
    type: Object,
  })
  variants?: Record<string, any>;

  @ApiProperty({
    description: 'SEO metadata',
    required: false,
    type: Object,
  })
  seo?: Record<string, any>;
}
