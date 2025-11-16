import { ApiProperty } from '@nestjs/swagger';

export class CreateCrmDto {
  @ApiProperty({
    description: 'Business ID this CRM belongs to',
  })
  businessId!: string;

  @ApiProperty({
    description: 'CRM configuration (pipelines, stages, etc.)',
    type: Object,
    required: false,
  })
  config?: Record<string, any>;
}
