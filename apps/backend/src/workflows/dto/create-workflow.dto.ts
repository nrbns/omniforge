import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkflowDto {
  @ApiProperty({
    description: 'Business ID this workflow belongs to',
  })
  businessId!: string;

  @ApiProperty({
    description: 'Workflow name',
  })
  name!: string;

  @ApiProperty({
    description: 'Workflow description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Trigger configuration',
    type: Object,
  })
  trigger!: Record<string, any>;

  @ApiProperty({
    description: 'Array of workflow steps',
    type: Object,
  })
  steps!: Record<string, any>;
}
