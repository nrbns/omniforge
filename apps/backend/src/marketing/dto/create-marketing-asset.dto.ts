import { ApiProperty } from '@nestjs/swagger';

export class CreateMarketingAssetDto {
  @ApiProperty({
    description: 'Business ID this asset belongs to',
  })
  businessId!: string;

  @ApiProperty({
    description: 'Asset type',
    example: 'landing_page',
  })
  type!: string;

  @ApiProperty({
    description: 'Title of the asset',
  })
  title!: string;

  @ApiProperty({
    description: 'Content payload for the asset',
    type: Object,
  })
  content!: Record<string, any>;

  @ApiProperty({
    description: 'Platform for this asset',
    required: false,
    example: 'facebook',
  })
  platform?: string;
}
