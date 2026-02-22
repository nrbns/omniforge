import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

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

  /** UI/UX style preferences (style, theme, layout, interaction) */
  @IsObject()
  @IsOptional()
  uiPreferences?: {
    style?: string;
    theme?: 'light' | 'dark' | 'auto';
    layout?: string;
    interaction?: string;
  };
}
