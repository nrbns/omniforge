import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Metrics Service
 * Tracks user behavior, feature usage, and conversion funnels
 * Integrates with Mixpanel/GA4 for analytics
 */
@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Track event (for Mixpanel/GA4)
   */
  async trackEvent(
    userId: string,
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    // Store in database for backup
    await this.prisma.$executeRaw`
      INSERT INTO "MetricEvent" ("userId", "eventName", "properties", "createdAt")
      VALUES (${userId}, ${eventName}, ${JSON.stringify(properties || {})}::jsonb, NOW())
      ON CONFLICT DO NOTHING
    `.catch((err: unknown) => {
      this.logger.warn('Failed to store metric event:', err);
    });

    // TODO: Send to Mixpanel/GA4
    // if (process.env.MIXPANEL_TOKEN) {
    //   await this.sendToMixpanel(userId, eventName, properties);
    // }
    // if (process.env.GA4_MEASUREMENT_ID) {
    //   await this.sendToGA4(userId, eventName, properties);
    // }

    this.logger.log(`Event tracked: ${eventName} by user ${userId}`);
  }

  /**
   * Track page view
   */
  async trackPageView(
    userId: string,
    page: string,
    properties?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent(userId, 'page_view', {
      page,
      ...properties,
    });
  }

  /**
   * Track conversion funnel
   */
  async trackFunnelStep(
    userId: string,
    funnelName: string,
    step: string,
    properties?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent(userId, 'funnel_step', {
      funnel: funnelName,
      step,
      ...properties,
    });
  }

  /**
   * Get user metrics
   */
  async getUserMetrics(userId: string, dateRange?: { start: Date; end: Date }) {
    const start = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = dateRange?.end || new Date();

    const metrics = await this.prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT "eventName") as unique_events,
        COUNT(*) as total_events,
        COUNT(DISTINCT DATE("createdAt")) as active_days
      FROM "MetricEvent"
      WHERE "userId" = ${userId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    `.catch(() => ({
      unique_events: 0,
      total_events: 0,
      active_days: 0,
    }));

    return {
      userId,
      period: { start, end },
      ...(metrics as any)[0],
    };
  }

  /**
   * Get funnel conversion rates
   */
  async getFunnelConversion(funnelName: string, dateRange?: { start: Date; end: Date }) {
    const start = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = dateRange?.end || new Date();

    const steps = await this.prisma.$queryRaw`
      SELECT 
        properties->>'step' as step,
        COUNT(DISTINCT "userId") as users,
        COUNT(*) as events
      FROM "MetricEvent"
      WHERE "eventName" = 'funnel_step'
      AND properties->>'funnel' = ${funnelName}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
      GROUP BY properties->>'step'
      ORDER BY MIN("createdAt")
    `.catch(() => []);

    return {
      funnel: funnelName,
      steps: (steps as any[]).map((s) => ({
        step: s.step,
        users: Number(s.users || 0),
        events: Number(s.events || 0),
      })),
    };
  }
}
