import { ApiProperty } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Email of the lead',
  })
  email!: string;

  @ApiProperty({
    description: 'First name',
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    description: 'Last name',
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'Phone number',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Source of the lead (landing_page, ad, referral, etc.)',
  })
  source!: string;

  @ApiProperty({
    description: 'Funnel ID this lead belongs to (optional)',
    required: false,
  })
  funnelId?: string;

  @ApiProperty({
    description: 'Arbitrary metadata captured with the lead',
    required: false,
    type: Object,
  })
  metadata?: Record<string, any>;
}
