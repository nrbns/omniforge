import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { CommitType } from '@prisma/client';

export class CommitIdeaDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(CommitType)
  type: CommitType;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  branch?: string;

  @IsObject()
  @IsOptional()
  diff?: Record<string, any>;

  @IsObject()
  @IsOptional()
  specSnapshot?: Record<string, any>;
}

