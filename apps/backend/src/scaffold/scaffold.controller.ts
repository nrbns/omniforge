import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  HttpCode,
  HttpStatus,
  Body,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import { ScaffoldService } from './scaffold.service';

@ApiTags('scaffold')
@Controller('scaffold')
export class ScaffoldController {
  private readonly logger = new Logger(ScaffoldController.name);

  constructor(private readonly scaffoldService: ScaffoldService) {}

  @Post('ideas/:ideaId/generate')
  @ApiOperation({ summary: 'Generate a project scaffold from an idea' })
  @ApiParam({ name: 'ideaId', description: 'Idea ID' })
  @ApiResponse({ status: 200, description: 'Scaffold generated successfully' })
  @HttpCode(HttpStatus.OK)
  async generateScaffold(
    @Param('ideaId') ideaId: string,
    @Body('projectName') projectName?: string
  ) {
    const filePath = await this.scaffoldService.generateScaffold(ideaId, projectName);
    const filename = path.basename(filePath);
    return {
      success: true,
      filePath,
      filename,
      downloadUrl: `/api/scaffold/download/${encodeURIComponent(filename)}`,
      message: 'Scaffold generated successfully',
    };
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Download a generated scaffold' })
  @ApiParam({ name: 'filename', description: 'Scaffold filename' })
  @ApiResponse({ status: 200, description: 'Scaffold file' })
  async downloadScaffold(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const stream = await this.scaffoldService.getScaffoldStream(filename);

      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      stream.pipe(res);
    } catch (error: any) {
      this.logger.error(`Error downloading scaffold ${filename}:`, error);
      res.status(404).json({ error: 'Scaffold not found', message: error.message });
    }
  }

  @Get('list')
  @ApiOperation({ summary: 'List available scaffolds' })
  @ApiResponse({ status: 200, description: 'List of available scaffolds' })
  async listScaffolds() {
    const scaffolds = await this.scaffoldService.listScaffolds();
    return {
      scaffolds: scaffolds.map((f) => ({
        filename: f,
        downloadUrl: `/scaffold/${encodeURIComponent(f)}/download`,
      })),
    };
  }
}
