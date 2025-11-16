import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../integrations/stripe/stripe.service';
import { EmailService } from '../email/email.service';

interface CrossToolMetrics {
  ecommerce: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    topProducts: Array<{ name: string; sales: number; quantity: number }>;
  };
  crm: {
    totalLeads: number;
    qualifiedLeads: number;
    conversionRate: number;
    pipelineValue: number;
    topSources: Array<{ source: string; count: number }>;
  };
  email: {
    totalSent: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    topCampaigns: Array<{ name: string; opens: number; clicks: number }>;
  };
  workflows: {
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    topWorkflows: Array<{ name: string; executions: number; successRate: number }>;
  };
  popups: {
    totalShown: number;
    conversionRate: number;
    topPopups: Array<{ name: string; shown: number; converted: number }>;
  };
  overall: {
    revenue: number;
    growth: number;
    activeUsers: number;
    engagement: number;
  };
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private emailService: EmailService,
  ) {}

  /**
   * Get unified analytics across all tools
   */
  async getUnifiedAnalytics(businessId: string, dateRange?: { start: Date; end: Date }): Promise<CrossToolMetrics> {
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = dateRange?.end || new Date();

    // E-Commerce metrics
    const ecommerce = await this.getECommerceMetrics(businessId, startDate, endDate);

    // CRM metrics
    const crm = await this.getCRMMetrics(businessId, startDate, endDate);

    // Email metrics
    const email = await this.getEmailMetrics(businessId, startDate, endDate);

    // Workflow metrics
    const workflows = await this.getWorkflowMetrics(businessId, startDate, endDate);

    // Popup metrics
    const popups = await this.getPopupMetrics(businessId, startDate, endDate);

    // Overall metrics
    const overall = {
      revenue: ecommerce.totalSales,
      growth: this.calculateGrowth(ecommerce.totalSales, businessId),
      activeUsers: await this.getActiveUsers(businessId, startDate, endDate),
      engagement: this.calculateEngagement(email, popups),
    };

    return {
      ecommerce,
      crm,
      email,
      workflows,
      popups,
      overall,
    };
  }

  private async getECommerceMetrics(businessId: string, start: Date, end: Date) {
    // Query orders from database (assuming Order model exists)
    // For now, use mock data structure
    const orders = await this.prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(amount), 0) as total_sales,
        COALESCE(AVG(amount), 0) as avg_order_value
      FROM "Order"
      WHERE "businessId" = ${businessId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    `.catch(() => ({
      total_orders: 0,
      total_sales: 0,
      avg_order_value: 0,
    }));

    const totalOrders = Number((orders as any)[0]?.total_orders || 0);
    const totalSales = Number((orders as any)[0]?.total_sales || 0);
    const avgOrderValue = Number((orders as any)[0]?.avg_order_value || 0);

    // Get top products
    const topProducts = await this.prisma.$queryRaw`
      SELECT 
        p.name,
        SUM(oi.quantity) as quantity,
        SUM(oi.price * oi.quantity) as sales
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "Order" o ON oi."orderId" = o.id
      WHERE o."businessId" = ${businessId}
      AND o."createdAt" >= ${start}
      AND o."createdAt" <= ${end}
      GROUP BY p.id, p.name
      ORDER BY sales DESC
      LIMIT 5
    `.catch(() => []);

    return {
      totalSales,
      totalOrders,
      averageOrderValue: avgOrderValue,
      conversionRate: 0.03, // Mock - calculate from sessions/orders
      topProducts: (topProducts as any[]).map((p) => ({
        name: p.name,
        sales: Number(p.sales || 0),
        quantity: Number(p.quantity || 0),
      })),
    };
  }

  private async getCRMMetrics(businessId: string, start: Date, end: Date) {
    // Query leads from database
    const leads = await this.prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(CASE WHEN "status" = 'qualified' THEN 1 END) as qualified_leads
      FROM "Lead"
      WHERE "businessId" = ${businessId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    `.catch(() => ({
      total_leads: 0,
      qualified_leads: 0,
    }));

    const totalLeads = Number((leads as any)[0]?.total_leads || 0);
    const qualifiedLeads = Number((leads as any)[0]?.qualified_leads || 0);

    // Get top sources
    const topSources = await this.prisma.$queryRaw`
      SELECT 
        "source",
        COUNT(*) as count
      FROM "Lead"
      WHERE "businessId" = ${businessId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
      GROUP BY "source"
      ORDER BY count DESC
      LIMIT 5
    `.catch(() => []);

    // Get pipeline value
    const pipelineValue = await this.prisma.$queryRaw`
      SELECT COALESCE(SUM("value"), 0) as total_value
      FROM "Deal"
      WHERE "businessId" = ${businessId}
      AND "status" != 'closed'
    `.catch(() => ({ total_value: 0 }));

    return {
      totalLeads,
      qualifiedLeads,
      conversionRate: totalLeads > 0 ? qualifiedLeads / totalLeads : 0,
      pipelineValue: Number((pipelineValue as any)[0]?.total_value || 0),
      topSources: (topSources as any[]).map((s) => ({
        source: s.source || 'Unknown',
        count: Number(s.count || 0),
      })),
    };
  }

  private async getEmailMetrics(businessId: string, start: Date, end: Date) {
    // Query email campaigns
    const campaigns = await this.prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_sent,
        SUM("opens") as total_opens,
        SUM("clicks") as total_clicks,
        SUM("bounces") as total_bounces
      FROM "MarketingAsset"
      WHERE "businessId" = ${businessId}
      AND "type" = 'email'
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    `.catch(() => ({
      total_sent: 0,
      total_opens: 0,
      total_clicks: 0,
      total_bounces: 0,
    }));

    const totalSent = Number((campaigns as any)[0]?.total_sent || 0);
    const totalOpens = Number((campaigns as any)[0]?.total_opens || 0);
    const totalClicks = Number((campaigns as any)[0]?.total_clicks || 0);
    const totalBounces = Number((campaigns as any)[0]?.total_bounces || 0);

    // Get top campaigns
    const topCampaigns = await this.prisma.$queryRaw`
      SELECT 
        name,
        opens,
        clicks
      FROM "MarketingAsset"
      WHERE "businessId" = ${businessId}
      AND "type" = 'email'
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
      ORDER BY opens DESC
      LIMIT 5
    `.catch(() => []);

    return {
      totalSent,
      openRate: totalSent > 0 ? totalOpens / totalSent : 0,
      clickRate: totalSent > 0 ? totalClicks / totalSent : 0,
      bounceRate: totalSent > 0 ? totalBounces / totalSent : 0,
      topCampaigns: (topCampaigns as any[]).map((c) => ({
        name: c.name || 'Unnamed',
        opens: Number(c.opens || 0),
        clicks: Number(c.clicks || 0),
      })),
    };
  }

  private async getWorkflowMetrics(businessId: string, start: Date, end: Date) {
    const executions = await this.prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_executions,
        COUNT(CASE WHEN "status" = 'success' THEN 1 END) as successful,
        AVG("duration") as avg_duration
      FROM "WorkflowExecution"
      WHERE "workflowId" IN (
        SELECT id FROM "Workflow" WHERE "businessId" = ${businessId}
      )
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    `.catch(() => ({
      total_executions: 0,
      successful: 0,
      avg_duration: 0,
    }));

    const totalExecutions = Number((executions as any)[0]?.total_executions || 0);
    const successful = Number((executions as any)[0]?.successful || 0);
    const avgDuration = Number((executions as any)[0]?.avg_duration || 0);

    // Get top workflows
    const topWorkflows = await this.prisma.$queryRaw`
      SELECT 
        w.name,
        COUNT(e.id) as executions,
        COUNT(CASE WHEN e.status = 'success' THEN 1 END) as successful
      FROM "Workflow" w
      LEFT JOIN "WorkflowExecution" e ON w.id = e."workflowId"
      WHERE w."businessId" = ${businessId}
      AND (e."createdAt" >= ${start} OR e."createdAt" IS NULL)
      AND (e."createdAt" <= ${end} OR e."createdAt" IS NULL)
      GROUP BY w.id, w.name
      ORDER BY executions DESC
      LIMIT 5
    `.catch(() => []);

    return {
      totalExecutions,
      successRate: totalExecutions > 0 ? successful / totalExecutions : 0,
      averageExecutionTime: avgDuration,
      topWorkflows: (topWorkflows as any[]).map((w) => ({
        name: w.name || 'Unnamed',
        executions: Number(w.executions || 0),
        successRate: Number(w.executions || 0) > 0 ? Number(w.successful || 0) / Number(w.executions || 0) : 0,
      })),
    };
  }

  private async getPopupMetrics(businessId: string, start: Date, end: Date) {
    // Mock popup metrics (would query from popup tracking table)
    return {
      totalShown: 0,
      conversionRate: 0,
      topPopups: [],
    };
  }

  private async getActiveUsers(businessId: string, start: Date, end: Date): Promise<number> {
    const users = await this.prisma.$queryRaw`
      SELECT COUNT(DISTINCT "userId") as active_users
      FROM "Order"
      WHERE "businessId" = ${businessId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    `.catch(() => ({ active_users: 0 }));

    return Number((users as any)[0]?.active_users || 0);
  }

  private calculateGrowth(currentRevenue: number, businessId: string): number {
    // Mock growth calculation (would compare with previous period)
    return 0.15; // 15% growth
  }

  private calculateEngagement(email: any, popups: any): number {
    // Combine email and popup engagement
    return (email.openRate + popups.conversionRate) / 2;
  }
}

