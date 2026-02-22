import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track an event' })
  @ApiResponse({ status: 200, description: 'Event tracked' })
  async trackEvent(
    @Body() body: { userId: string; eventName: string; properties?: Record<string, any> }
  ) {
    await this.metricsService.trackEvent(body.userId, body.eventName, body.properties);
    return { success: true };
  }

  @Post('pageview')
  @ApiOperation({ summary: 'Track a page view' })
  @ApiResponse({ status: 200, description: 'Page view tracked' })
  async trackPageView(
    @Body() body: { userId: string; page: string; properties?: Record<string, any> }
  ) {
    await this.metricsService.trackPageView(body.userId, body.page, body.properties);
    return { success: true };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user metrics' })
  @ApiResponse({ status: 200, description: 'User metrics' })
  async getUserMetrics(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const dateRange =
      startDate && endDate
        ? {
            start: new Date(startDate),
            end: new Date(endDate),
          }
        : undefined;

    return this.metricsService.getUserMetrics(userId, dateRange);
  }

  @Get('funnel/:funnelName')
  @ApiOperation({ summary: 'Get funnel conversion rates' })
  @ApiResponse({ status: 200, description: 'Funnel metrics' })
  async getFunnelConversion(
    @Param('funnelName') funnelName: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const dateRange =
      startDate && endDate
        ? {
            start: new Date(startDate),
            end: new Date(endDate),
          }
        : undefined;

    return this.metricsService.getFunnelConversion(funnelName, dateRange);
  }
}
