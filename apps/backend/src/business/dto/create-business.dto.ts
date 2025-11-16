import { ApiProperty } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'Associated project ID',
  })
  projectId!: string;

  @ApiProperty({
    description: 'Business type, e.g. saas, ecommerce, marketplace, service',
    example: 'saas',
  })
  businessType!: string;

  @ApiProperty({
    description: 'Business model, e.g. subscription, one-time, commission',
    example: 'subscription',
  })
  businessModel!: string;

  @ApiProperty({
    description: 'Target audience description or JSON',
    required: false,
    type: Object,
  })
  targetAudience?: Record<string, any>;

  @ApiProperty({
    description: 'Revenue model configuration',
    required: false,
    type: Object,
  })
  revenueModel?: Record<string, any>;

  @ApiProperty({
    description: 'High-level marketing strategy',
    required: false,
    type: Object,
  })
  marketingStrategy?: Record<string, any>;

  @ApiProperty({
    description: 'Competitive analysis data',
    required: false,
    type: Object,
  })
  competitiveAnalysis?: Record<string, any>;
}
