import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Public() // Allow anonymous feedback
  @ApiOperation({ summary: 'Submit feedback' })
  @ApiResponse({ status: 201, description: 'Feedback submitted' })
  async create(@Body() dto: any) {
    return this.feedbackService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedback (admin)' })
  @ApiResponse({ status: 200, description: 'List of feedback' })
  async findAll(@Query('status') status?: string) {
    return this.feedbackService.findAll(status);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update feedback status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'open' | 'in_progress' | 'resolved' | 'closed' },
  ) {
    return this.feedbackService.updateStatus(id, body.status);
  }
}

