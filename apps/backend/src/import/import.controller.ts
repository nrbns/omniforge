import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { UrlImportService } from './url-import.service';
import { ImageImportService } from './image-import.service';
import { FigmaImportService } from './figma-import.service';
import type { AppSpec } from '@omniforge/shared';

class ImportUrlDto {
  url!: string;
}

class ImportFigmaDto {
  urlOrKey!: string;
  nodeId?: string;
}

@ApiTags('import')
@Controller('import')
@Public()
export class ImportController {
  constructor(
    private readonly urlImport: UrlImportService,
    private readonly imageImport: ImageImportService,
    private readonly figmaImport: FigmaImportService,
  ) {}

  @Post('url')
  @ApiOperation({ summary: 'Import layout from website URL' })
  async fromUrl(@Body() dto: ImportUrlDto): Promise<AppSpec> {
    return this.urlImport.importFromUrl(dto.url);
  }

  @Post('image')
  @ApiOperation({ summary: 'Import layout from image (base64 in body)' })
  async fromImage(@Body() body: { image?: string }): Promise<AppSpec> {
    const imageBase64 = body?.image;
    if (!imageBase64) {
      return this.imageImport.getDefaultSpec('From Image');
    }
    return this.imageImport.importFromImage(imageBase64);
  }

  @Post('figma')
  @ApiOperation({ summary: 'Import layout from Figma file URL or key' })
  async fromFigma(@Body() dto: ImportFigmaDto): Promise<AppSpec> {
    return this.figmaImport.importFromFigma(dto.urlOrKey, dto.nodeId);
  }
}
