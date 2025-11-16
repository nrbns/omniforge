import { ApiProperty } from '@nestjs/swagger';

export class UpsertStoreDto {
  @ApiProperty({
    description: 'Business ID this store belongs to',
  })
  businessId!: string;

  @ApiProperty({
    description: 'Store name',
  })
  name!: string;

  @ApiProperty({
    description: 'Store domain (optional)',
    required: false,
  })
  domain?: string;

  @ApiProperty({
    description: 'Store currency code',
    example: 'USD',
    required: false,
  })
  currency?: string;

  @ApiProperty({
    description: 'Tax configuration',
    type: Object,
    required: false,
  })
  taxConfig?: Record<string, any>;

  @ApiProperty({
    description: 'Shipping configuration',
    type: Object,
    required: false,
  })
  shippingConfig?: Record<string, any>;

  @ApiProperty({
    description: 'Payment configuration',
    type: Object,
    required: false,
  })
  paymentConfig?: Record<string, any>;
}
