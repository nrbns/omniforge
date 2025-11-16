import { Controller, Post, UploadedFile, UseInterceptors, Param, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: 'pdf' | 'image' | 'audio' | 'text',
    @Body('ideaId') ideaId?: string
  ) {
    return this.documentService.processDocument(file, type, ideaId);
  }

  @Post('ideas/:ideaId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadForIdea(
    @Param('ideaId') ideaId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: 'pdf' | 'image' | 'audio' | 'text'
  ) {
    return this.documentService.processDocument(file, type, ideaId);
  }
}
