'use client';

import type { LayoutNode } from '@omniforge/editor';
import { useBuilderStore } from '../../stores/builder-store';

function NodeItem({ node, depth = 0 }: { node: LayoutNode; depth?: number }) {
  const { selectedNodeId, setSelectedNode } = useBuilderStore();
  const isSelected = node.id && selectedNodeId === node.id;

  return (
    <div className="mb-1">
      <button
        onClick={() => node.id && setSelectedNode(node.id)}
        className={`w-full text-left px-2 py-1 rounded-lg text-xs transition-colors duration-200 ${
          isSelected ? 'bg-violet-500/20 text-violet-300' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.type}
        {node.id && <span className="opacity-60 ml-1">#{node.id.slice(0, 6)}</span>}
      </button>
      {node.children?.map((child, i) => (
        <NodeItem key={child.id || i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function ComponentTree() {
  const { layout } = useBuilderStore();

  if (!layout?.children?.length) {
    return (
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Components</h3>
        <p className="text-xs text-gray-500">No components</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Components</h3>
      <div className="space-y-0">
        {layout.children.map((node, i) => (
          <NodeItem key={node.id || i} node={node} />
        ))}
      </div>
    </div>
  );
}
