'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface MatplotlibChartProps {
  pythonCode: string;
  chartType?: 'line' | 'bar' | 'pie';
}

/**
 * Matplotlib Chart Component
 * Runs Python matplotlib code in sandbox and displays chart
 */
export function MatplotlibChart({ pythonCode, chartType = 'line' }: MatplotlibChartProps) {
  const [chartData, setChartData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pythonCode) {
      generateChart();
    }
  }, [pythonCode]);

  const generateChart = async () => {
    setLoading(true);
    try {
      // Run Python code in sandbox
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/sandbox/python`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: `
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64
from io import BytesIO

${pythonCode}

# Save to base64
buf = BytesIO()
plt.savefig(buf, format='png')
buf.seek(0)
img_base64 = base64.b64encode(buf.read()).decode('utf-8')
print(f"CHART_DATA:{img_base64}")
plt.close()
`,
          }),
        },
      );

      if (!response.ok) throw new Error('Failed to generate chart');

      const result = await response.text();
      const chartMatch = result.match(/CHART_DATA:(.+)/);
      if (chartMatch) {
        setChartData(`data:image/png;base64,${chartMatch[1]}`);
      }
    } catch (error) {
      toast.error('Failed to generate chart', {
        description: error instanceof Error ? error.message : 'Please check your Python code',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
        <div className="text-gray-500">Generating chart...</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
        <div className="text-gray-500">No chart data</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <img src={chartData} alt="Chart" className="w-full h-auto" />
    </div>
  );
}

