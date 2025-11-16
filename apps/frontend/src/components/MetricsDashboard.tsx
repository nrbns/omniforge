'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface MetricsDashboardProps {
  userId: string;
}

export default function MetricsDashboard({ userId }: MetricsDashboardProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [userId]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/metrics/user/${userId}`,
      );
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      toast.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  // Track page view
  useEffect(() => {
    if (userId) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/metrics/pageview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, page: '/dashboard/metrics' }),
      }).catch(() => {});
    }
  }, [userId]);

  if (loading) {
    return <div className="p-6">Loading metrics...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Metrics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Unique Events</div>
          <div className="text-2xl font-bold">{metrics?.unique_events || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Events</div>
          <div className="text-2xl font-bold">{metrics?.total_events || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active Days</div>
          <div className="text-2xl font-bold">{metrics?.active_days || 0}</div>
        </div>
      </div>
    </div>
  );
}

