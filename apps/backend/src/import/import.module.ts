import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImportController } from './import.controller';
import { UrlImportService } from './url-import.service';
import { ImageImportService } from './image-import.service';
import { FigmaImportService } from './figma-import.service';

@Module({
  imports: [ConfigModule],
  controllers: [ImportController],
  providers: [UrlImportService, ImageImportService, FigmaImportService],
  exports: [UrlImportService, ImageImportService, FigmaImportService],
})
export class ImportModule {}
