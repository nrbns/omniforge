'use client';

import { useBuilderStore } from '../../stores/builder-store';

export function FileExplorer() {
  const { generatedFiles } = useBuilderStore();
  const files = Object.keys(generatedFiles);

  if (files.length === 0) {
    return (
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Files</h3>
        <p className="text-xs text-gray-500">No files generated yet.</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Generated Files</h3>
      <ul className="space-y-1">
        {files.map((path) => (
          <li
            key={path}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-mono text-gray-300 hover:bg-white/5 transition-colors"
          >
            <span className="text-cyan-400">{path.startsWith('/') ? path.slice(1) : path}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
