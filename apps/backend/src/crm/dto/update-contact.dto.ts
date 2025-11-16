import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContactDto {
  @ApiPropertyOptional({
    description: 'First name',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company name',
  })
  company?: string;

  @ApiPropertyOptional({
    description: 'Job title',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Tags for segmentation',
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Lead score',
  })
  leadScore?: number;

  @ApiPropertyOptional({
    description: 'Status',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Lead source',
  })
  source?: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  notes?: string;
}
