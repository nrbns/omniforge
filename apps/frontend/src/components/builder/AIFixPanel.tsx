'use client';

import { useState } from 'react';
import { useBuilderStore } from '../../stores/builder-store';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export function AIFixPanel() {
  const { previewError, setPreviewError, generatedFiles } = useBuilderStore();
  const [fixing, setFixing] = useState(false);

  if (!previewError) return null;

  const handleSuggestFix = async () => {
    const files = Object.entries(generatedFiles);
    if (files.length === 0) {
      toast.error('No code to fix');
      return;
    }
    setFixing(true);
    try {
      const res = await fetch(`${API}/api/builder/suggest-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: previewError,
          code: files[0][1],
          filePath: files[0][0],
        }),
      });
      const data = await res.json();
      if (data?.suggestion) {
        useBuilderStore.setState({
          generatedFiles: { ...generatedFiles, [files[0][0]]: data.suggestion },
        });
        setPreviewError(null);
        toast.success('Fix applied');
      }
    } catch (e) {
      toast.error('Fix request failed');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="p-4 border-t border-white/10">
      <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">AI Fix</h3>
      <p className="text-xs text-gray-400 mb-3 truncate" title={previewError}>{previewError}</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPreviewError(null)}
          className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
        >
          Dismiss
        </button>
        <button
          onClick={() => {
            useBuilderStore.getState().syncGeneratedFiles?.();
            setPreviewError(null);
          }}
          className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
        >
          Retry
        </button>
        <button
          onClick={handleSuggestFix}
          disabled={fixing || Object.keys(generatedFiles).length === 0}
          className="px-3 py-1.5 text-xs bg-violet-600/50 rounded-lg hover:bg-violet-600/70 disabled:opacity-50"
        >
          {fixing ? 'Fixing...' : 'Suggest fix'}
        </button>
      </div>
    </div>
  );
}
