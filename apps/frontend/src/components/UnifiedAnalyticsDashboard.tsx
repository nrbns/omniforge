'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AnalyticsData {
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

interface UnifiedAnalyticsDashboardProps {
  businessId: string;
}

export default function UnifiedAnalyticsDashboard({ businessId }: UnifiedAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [businessId, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/analytics/unified/${businessId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analytics = await response.json();
      setData(analytics);
    } catch (error) {
      toast.error('Failed to load analytics', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Unified Analytics</h1>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${data.overall.revenue.toLocaleString()}`}
          change={`+${(data.overall.growth * 100).toFixed(1)}%`}
          icon="💰"
        />
        <MetricCard
          title="Active Users"
          value={data.overall.activeUsers.toLocaleString()}
          change=""
          icon="👥"
        />
        <MetricCard
          title="Engagement"
          value={`${(data.overall.engagement * 100).toFixed(1)}%`}
          change=""
          icon="📊"
        />
        <MetricCard
          title="Total Orders"
          value={data.ecommerce.totalOrders.toLocaleString()}
          change=""
          icon="🛒"
        />
      </div>

      {/* E-Commerce Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">E-Commerce</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Total Sales</div>
            <div className="text-2xl font-bold">${data.ecommerce.totalSales.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Orders</div>
            <div className="text-2xl font-bold">{data.ecommerce.totalOrders}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Avg Order Value</div>
            <div className="text-2xl font-bold">${data.ecommerce.averageOrderValue.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Conversion Rate</div>
            <div className="text-2xl font-bold">{(data.ecommerce.conversionRate * 100).toFixed(2)}%</div>
          </div>
        </div>
        {data.ecommerce.topProducts.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Top Products</div>
            <div className="space-y-2">
              {data.ecommerce.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{product.name}</span>
                  <span className="text-sm font-medium">${product.sales.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CRM Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">CRM</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Total Leads</div>
            <div className="text-2xl font-bold">{data.crm.totalLeads}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Qualified</div>
            <div className="text-2xl font-bold">{data.crm.qualifiedLeads}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Conversion</div>
            <div className="text-2xl font-bold">{(data.crm.conversionRate * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Pipeline Value</div>
            <div className="text-2xl font-bold">${data.crm.pipelineValue.toLocaleString()}</div>
          </div>
        </div>
        {data.crm.topSources.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Top Lead Sources</div>
            <div className="space-y-2">
              {data.crm.topSources.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{source.source}</span>
                  <span className="text-sm font-medium">{source.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Email Marketing</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Total Sent</div>
            <div className="text-2xl font-bold">{data.email.totalSent.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Open Rate</div>
            <div className="text-2xl font-bold">{(data.email.openRate * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Click Rate</div>
            <div className="text-2xl font-bold">{(data.email.clickRate * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Bounce Rate</div>
            <div className="text-2xl font-bold">{(data.email.bounceRate * 100).toFixed(1)}%</div>
          </div>
        </div>
        {data.email.topCampaigns.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Top Campaigns</div>
            <div className="space-y-2">
              {data.email.topCampaigns.map((campaign, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{campaign.name}</span>
                  <span className="text-sm font-medium">
                    {campaign.opens} opens, {campaign.clicks} clicks
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Workflows Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Workflows</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Total Executions</div>
            <div className="text-2xl font-bold">{data.workflows.totalExecutions.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Success Rate</div>
            <div className="text-2xl font-bold">{(data.workflows.successRate * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Avg Execution Time</div>
            <div className="text-2xl font-bold">{data.workflows.averageExecutionTime.toFixed(0)}ms</div>
          </div>
        </div>
        {data.workflows.topWorkflows.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Top Workflows</div>
            <div className="space-y-2">
              {data.workflows.topWorkflows.map((workflow, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{workflow.name}</span>
                  <span className="text-sm font-medium">
                    {workflow.executions} runs, {(workflow.successRate * 100).toFixed(0)}% success
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon }: { title: string; value: string; change: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {change && <div className="text-sm text-green-600 mt-1">{change}</div>}
    </div>
  );
}

