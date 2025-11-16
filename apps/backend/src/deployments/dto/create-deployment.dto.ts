import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateDeploymentDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  buildId?: string;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
