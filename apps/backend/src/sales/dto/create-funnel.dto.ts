import { ApiProperty } from '@nestjs/swagger';

export class CreateFunnelDto {
  @ApiProperty({
    description: 'Business ID this funnel belongs to',
  })
  businessId!: string;

  @ApiProperty({
    description: 'Name of the sales funnel',
    example: 'Default SaaS Funnel',
  })
  name!: string;

  @ApiProperty({
    description: 'Description of the funnel',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Array of funnel stages and configuration',
    type: Object,
  })
  stages!: Record<string, any>;
}
