'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ExportTemplatesProps {
  businessId: string;
}

export default function ExportTemplates({ businessId }: ExportTemplatesProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: 'figma' | 'shopify' | 'nextjs' | 'react', apiKey?: string) => {
    try {
      setExporting(type);
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

      if (type === 'figma') {
        const response = await fetch(`${baseUrl}/api/export/figma/${businessId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey }),
        });
        const data = await response.json();
        
        // Download as JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `figma-variables-${businessId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Figma variables exported!', {
          description: 'Import this JSON into Figma via Variables API or Plugin',
        });
      } else if (type === 'shopify') {
        const response = await fetch(`${baseUrl}/api/export/shopify-template/${businessId}`);
        const template = await response.text();
        
        // Download as .liquid file
        const blob = new Blob([template], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shopify-template-${businessId}.liquid`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Shopify template exported!', {
          description: 'Upload this .liquid file to your Shopify theme',
        });
      } else if (type === 'nextjs') {
        const response = await fetch(`${baseUrl}/api/export/nextjs-template/${businessId}`);
        const data = await response.json();
        
        // Create zip or download files
        toast.success('Next.js template ready!', {
          description: `${data.pages.length} pages and ${data.components.length} components generated`,
        });
        
        // Download as JSON (user can extract files)
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nextjs-template-${businessId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (type === 'react') {
        const response = await fetch(`${baseUrl}/api/export/react-template/${businessId}`);
        const data = await response.json();
        
        toast.success('React template ready!', {
          description: `${data.components.length} components generated`,
        });
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `react-template-${businessId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error(`Failed to export ${type} template`, {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">One-Click Export Templates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Figma Export */}
        <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <div>
              <h3 className="font-semibold">Figma Variables</h3>
              <p className="text-sm text-gray-600">Export design tokens</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('figma')}
            disabled={exporting === 'figma'}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {exporting === 'figma' ? 'Exporting...' : 'Export to Figma'}
          </button>
        </div>

        {/* Shopify Export */}
        <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <div>
              <h3 className="font-semibold">Shopify Template</h3>
              <p className="text-sm text-gray-600">Liquid template code</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('shopify')}
            disabled={exporting === 'shopify'}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {exporting === 'shopify' ? 'Exporting...' : 'Export Shopify Template'}
          </button>
        </div>

        {/* Next.js Export */}
        <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold">Next.js Template</h3>
              <p className="text-sm text-gray-600">Pages & components</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('nextjs')}
            disabled={exporting === 'nextjs'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {exporting === 'nextjs' ? 'Exporting...' : 'Export Next.js Template'}
          </button>
        </div>

        {/* React Export */}
        <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚛️</span>
            </div>
            <div>
              <h3 className="font-semibold">React Template</h3>
              <p className="text-sm text-gray-600">React components</p>
            </div>
          </div>
          <button
            onClick={() => handleExport('react')}
            disabled={exporting === 'react'}
            className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
          >
            {exporting === 'react' ? 'Exporting...' : 'Export React Template'}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> Export templates are ready-to-use code that you can copy into your projects.
          No API keys required for basic exports—just download and use!
        </p>
      </div>
    </div>
  );
}

