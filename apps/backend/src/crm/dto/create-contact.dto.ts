import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    description: 'CRM ID this contact belongs to',
  })
  crmId!: string;

  @ApiProperty({
    description: 'Contact email address',
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
    description: 'Company name',
    required: false,
  })
  company?: string;

  @ApiProperty({
    description: 'Job title',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Tags for segmentation',
    required: false,
    type: [String],
  })
  tags?: string[];

  @ApiProperty({
    description: 'Lead source',
    required: false,
  })
  source?: string;

  @ApiProperty({
    description: 'Notes about the contact',
    required: false,
  })
  notes?: string;
}
