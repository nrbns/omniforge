import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBusinessDto {
  @ApiPropertyOptional({
    description: 'Business type, e.g. saas, ecommerce, marketplace, service',
    example: 'saas',
  })
  businessType?: string;

  @ApiPropertyOptional({
    description: 'Business model, e.g. subscription, one-time, commission',
    example: 'subscription',
  })
  businessModel?: string;

  @ApiPropertyOptional({
    description: 'Target audience description or JSON',
    type: Object,
  })
  targetAudience?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Revenue model configuration',
    type: Object,
  })
  revenueModel?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'High-level marketing strategy',
    type: Object,
  })
  marketingStrategy?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Competitive analysis data',
    type: Object,
  })
  competitiveAnalysis?: Record<string, any>;
}
