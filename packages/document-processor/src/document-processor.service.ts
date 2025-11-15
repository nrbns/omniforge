import { ProcessedDocument, DocumentType } from './types';
import { PDFProcessor } from './pdf-processor';
import { ImageProcessor } from './image-processor';
import { VoiceProcessor } from './voice-processor';
import * as fs from 'fs/promises';

export class DocumentProcessorService {
  private pdfProcessor: PDFProcessor;
  private imageProcessor: ImageProcessor;
  private voiceProcessor: VoiceProcessor;

  constructor(imageProcessor?: ImageProcessor) {
    this.pdfProcessor = new PDFProcessor();
    this.imageProcessor = imageProcessor || new ImageProcessor();
    this.voiceProcessor = new VoiceProcessor();
  }

  /**
   * Process any document type
   */
  async process(filePath: string, type: DocumentType): Promise<ProcessedDocument> {
    const buffer = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);

    switch (type) {
      case 'pdf':
        return this.processPDF(buffer, stats);
      case 'image':
        return this.processImage(buffer, stats);
      case 'audio':
        return this.processAudio(buffer, stats);
      case 'text':
      case 'markdown':
        return this.processText(buffer, stats);
      default:
        throw new Error(`Unsupported document type: ${type}`);
    }
  }

  private async processPDF(buffer: Buffer, stats: any): Promise<ProcessedDocument> {
    const result = await this.pdfProcessor.processPDF(buffer);
    return {
      type: 'pdf',
      content: result.extractedText || '',
      metadata: {
        size: stats.size,
        pages: result.metadata.pages,
        extractedAt: new Date(),
      },
      extractedText: result.extractedText,
      images: result.images,
      tables: result.tables,
    };
  }

  private async processImage(buffer: Buffer, stats: any): Promise<ProcessedDocument> {
    const text = await this.imageProcessor.extractText(buffer);
    const description = await this.imageProcessor.describeImage(buffer);
    
    return {
      type: 'image',
      content: description,
      metadata: {
        size: stats.size,
        extractedAt: new Date(),
      },
      extractedText: text,
    };
  }

  private async processAudio(buffer: Buffer, stats: any): Promise<ProcessedDocument> {
    const transcript = await this.voiceProcessor.transcribe(buffer);
    const speakers = await this.voiceProcessor.extractSpeakers(buffer);
    
    return {
      type: 'audio',
      content: transcript,
      metadata: {
        size: stats.size,
        extractedAt: new Date(),
      },
      extractedText: transcript,
    };
  }

  private async processText(buffer: Buffer, stats: any): Promise<ProcessedDocument> {
    const content = buffer.toString('utf-8');
    
    return {
      type: 'text',
      content,
      metadata: {
        size: stats.size,
        extractedAt: new Date(),
      },
      extractedText: content,
    };
  }
}

