import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { HuggingFaceService } from '../huggingface/huggingface.service';
import { DocumentProcessorService, ImageProcessor } from '@omniforge/document-processor';

@Module({
  imports: [],
  controllers: [DocumentController],
  providers: [
    {
      provide: 'DocumentProcessorService',
      useFactory: (huggingFace: HuggingFaceService) => {
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
