'use client';

import dynamic from 'next/dynamic';
import { useBuilderStore } from '../../stores/builder-store';
import { layoutToSandpackFiles } from '@omniforge/editor';

const Sandpack = dynamic(
  () => import('@codesandbox/sandpack-react').then((m) => m.Sandpack),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-64 bg-gray-900 text-gray-400">Loading preview...</div> }
);

interface LivePreviewProps {
  layout: Parameters<typeof layoutToSandpackFiles>[0] | null;
  className?: string;
}

export function LivePreview({ layout, className = '' }: LivePreviewProps) {
  const { generatedFiles } = useBuilderStore();

  const files = Object.keys(generatedFiles).length > 0
    ? generatedFiles
    : layout
      ? layoutToSandpackFiles(layout)
      : {};
  const sandpackFiles = Object.fromEntries(
    Object.entries(files).map(([path, content]) => [path, { code: content }])
  );

  if (!layout && Object.keys(files).length === 0) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-900 text-gray-500 ${className}`}>
        <p>No layout to preview. Load an idea or create a page.</p>
      </div>
    );
  }

  if (Object.keys(sandpackFiles).length === 0) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-900 text-gray-500 ${className}`}>
        <p>Generating preview...</p>
      </div>
    );
  }

  return (
    <div className={`h-full min-h-[400px] ${className}`}>
      <Sandpack
        template="react"
        theme="dark"
        files={sandpackFiles}
        options={{
          showNavigator: false,
          showTabs: false,
          showLineNumbers: false,
          editorHeight: 120,
          autorun: true,
        }}
      />
    </div>
  );
}
