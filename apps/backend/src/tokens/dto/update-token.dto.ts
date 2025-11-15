import { IsString, IsOptional } from 'class-validator';

export class UpdateTokenDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  figmaId?: string;
}

