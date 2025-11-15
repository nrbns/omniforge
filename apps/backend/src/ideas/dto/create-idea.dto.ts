import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  rawInput?: string;
}

