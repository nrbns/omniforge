'use client';

import { useEffect, useState } from 'react';
import { FunnelChart, Funnel, LabelList, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SalesFunnelChartProps {
  businessId: string;
}

export default function SalesFunnelChart({ businessId }: SalesFunnelChartProps) {
  const [funnelData, setFunnelData] = useState<any[]>([]);

  useEffect(() => {
    fetchFunnelData();
  }, [businessId]);

  const fetchFunnelData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/metrics/funnel/sales?businessId=${businessId}`,
      );
      if (!response.ok) throw new Error('Failed to fetch funnel data');
      const data = await response.json();

      // Transform to funnel chart format
      const transformed = data.steps.map((step: any, index: number) => ({
        name: step.step,
        value: step.users,
        fill: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'][index] || '#e9d5ff',
      }));

      setFunnelData(transformed);
    } catch (error) {
      // Use mock data
      setFunnelData([
        { name: 'Visitors', value: 1000, fill: '#7c3aed' },
        { name: 'Leads', value: 500, fill: '#8b5cf6' },
        { name: 'Qualified', value: 200, fill: '#a78bfa' },
        { name: 'Opportunities', value: 100, fill: '#c4b5fd' },
        { name: 'Closed', value: 50, fill: '#ddd6fe' },
      ]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Sales Funnel</h3>
      <ResponsiveContainer width="100%" height={400}>
        <FunnelChart>
          <Tooltip />
          <Funnel dataKey="value" data={funnelData} isAnimationActive>
            <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}

