import { IsObject, IsOptional } from 'class-validator';

export class BuildProjectDto {
  @IsObject()
  @IsOptional()
  options?: Record<string, any>;
}
