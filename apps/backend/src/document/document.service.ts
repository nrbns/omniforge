import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VectorStoreService } from '@omniforge/rag';
import { DocumentProcessorService, ProcessedDocument } from '@omniforge/document-processor';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private vectorStore: VectorStoreService
  ) {}

  async processDocument(
    file: Express.Multer.File,
    type: 'pdf' | 'image' | 'audio' | 'text',
    ideaId?: string
  ): Promise<ProcessedDocument> {
    // This would ideally be injected; for now we create a processor instance directly
    const processor = new DocumentProcessorService();

    // Save file temporarily
    const tempPath = path.join(process.cwd(), 'temp', file.originalname);
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, file.buffer);

    // Process document
    const processed = await processor.process(tempPath, type);

    // Clean up temp file
    await fs.unlink(tempPath).catch(() => {});

    // Index in vector database if idea ID provided
    if (ideaId) {
      await this.indexDocument(processed, ideaId);
    }

    return processed;
  }

  private async indexDocument(doc: ProcessedDocument, ideaId: string): Promise<void> {
    try {
      await this.vectorStore.upsert('omniforge', [
        {
          id: `${ideaId}-doc-${Date.now()}`,
          content: doc.extractedText || doc.content,
          metadata: {
            type: 'user_input',
            ideaId,
            source: doc.metadata.filename,
            processedAt: doc.metadata.extractedAt,
            createdAt: new Date(),
          },
        },
      ]);
    } catch (error) {
      console.error('Error indexing document:', error);
    }
  }
}
