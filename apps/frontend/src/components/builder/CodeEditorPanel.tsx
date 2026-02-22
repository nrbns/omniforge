'use client';

import { useState, useEffect } from 'react';
import { useBuilderStore } from '../../stores/builder-store';

export function CodeEditorPanel() {
  const { generatedFiles } = useBuilderStore();
  const files = Object.keys(generatedFiles);
  const [selectedFile, setSelectedFile] = useState<string | null>(files[0] || null);

  useEffect(() => {
    if (files.length > 0 && (!selectedFile || !files.includes(selectedFile))) {
      setSelectedFile(files[0]);
    }
  }, [files.join(','), selectedFile]);

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No generated code. Load a layout first.
      </div>
    );
  }

  const content = selectedFile ? generatedFiles[selectedFile] : '';

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 p-2 border-b border-white/10 overflow-x-auto">
        {files.map((path) => {
          const name = path.startsWith('/') ? path.slice(1) : path;
          return (
            <button
              key={path}
              onClick={() => setSelectedFile(path)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg whitespace-nowrap transition-colors ${
                selectedFile === path ? 'bg-violet-600/50 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-words">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}
