import { IsString, IsOptional } from 'class-validator';

export class UpdateIdeaDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  rawInput?: string;
}

