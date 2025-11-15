import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { HuggingFaceService } from '../huggingface/huggingface.service';

@Module({
  imports: [],
  controllers: [DocumentController],
  providers: [
    {
      provide: 'DocumentProcessorService',
      useFactory: (huggingFace: HuggingFaceService) => {
        const { DocumentProcessorService } = require('@omniforge/document-processor');
        const { ImageProcessor } = require('@omniforge/document-processor');
        const imageProcessor = new ImageProcessor(huggingFace);
        return new DocumentProcessorService(imageProcessor);
      },
      inject: [HuggingFaceService],
    },
    DocumentService,
  ],
  exports: [DocumentService],
})
export class DocumentModule {}

