import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  figmaId?: string;
}

