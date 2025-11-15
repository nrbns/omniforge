import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScaffoldGenerator } from './scaffold-generator';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';

@Injectable()
export class ScaffoldService {
  private readonly logger = new Logger(ScaffoldService.name);
  private readonly outputDir = path.join(process.cwd(), 'output');

  constructor(private prisma: PrismaService) {
    // Ensure output directory exists
    fs.mkdir(this.outputDir, { recursive: true }).catch((err) => {
      this.logger.error('Error creating output directory:', err);
    });
  }

  /**
   * Generate a project scaffold from an idea's specification
   */
  async generateScaffold(ideaId: string, projectName?: string): Promise<string> {
    // Get idea with spec
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      throw new Error(`Idea ${ideaId} not found`);
    }

    if (!idea.specJson) {
      throw new Error(`Idea ${ideaId} has no specification. Parse it first.`);
    }

    const spec = idea.specJson as AppSpec;
    const name = projectName || spec.name || idea.title;

    this.logger.log(`Generating scaffold for idea ${ideaId} as "${name}"`);

    // Generate scaffold
    const generator = new ScaffoldGenerator(this.outputDir);
    const tarPath = await generator.generate(spec, name);

    // Create build record
    const build = await this.prisma.build.create({
      data: {
        projectId: ideaId, // Using ideaId as placeholder
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
        outputPath: tarPath,
        logs: JSON.stringify([
          { timestamp: new Date().toISOString(), level: 'info', message: 'Scaffold generated successfully' },
        ]),
      },
    });

    this.logger.log(`Scaffold generated: ${tarPath} (Build ID: ${build.id})`);

    return tarPath;
  }

  /**
   * Get scaffold file as stream
   */
  async getScaffoldStream(filename: string): Promise<NodeJS.ReadableStream> {
    const fullPath = path.join(this.outputDir, filename);
    
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        throw new Error(`Path ${filename} is not a file`);
      }

      const stream = fsSync.createReadStream(fullPath);
      return stream;
    } catch (error: any) {
      this.logger.error(`Error reading scaffold file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * List available scaffolds
   */
  async listScaffolds(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.outputDir);
      return files.filter((f) => f.endsWith('.tar.gz'));
    } catch (error) {
      this.logger.error('Error listing scaffolds:', error);
      return [];
    }
  }
}

