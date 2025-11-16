import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CodeReviewService } from './code-review.service';

@Controller('code-review')
export class CodeReviewController {
  constructor(private readonly codeReviewService: CodeReviewService) {}

  @Post('review')
  async reviewCode(@Body('code') code: string, @Body('language') language: string = 'typescript') {
    return this.codeReviewService.reviewCode(code, language);
  }

  @Post('optimize')
  async optimizeCode(
    @Body('code') code: string,
    @Body('review') review: any,
    @Body('language') language: string = 'typescript'
  ) {
    return this.codeReviewService.optimizeCode(code, review, language);
  }

  @Post('optimize-performance')
  async optimizePerformance(
    @Body('code') code: string,
    @Body('language') language: string = 'typescript'
  ) {
    return this.codeReviewService.optimizePerformance(code, language);
  }

  @Post('analyze')
  async analyzeCode(@Body('code') code: string, @Body('language') language: string = 'typescript') {
    return this.codeReviewService.fullCodeAnalysis(code, language);
  }

  @Get('monitoring')
  async generateMonitoring(@Query('framework') framework: string = 'nextjs') {
    return this.codeReviewService.generateMonitoring(framework);
  }
}
