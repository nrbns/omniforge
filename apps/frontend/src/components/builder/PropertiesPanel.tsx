'use client';

import { useBuilderStore } from '../../stores/builder-store';
import type { LayoutNode } from '@omniforge/editor';

function findNode(nodes: LayoutNode[], id: string): LayoutNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function PropertiesPanel() {
  const { layout, selectedNodeId, updateNodeProps, pushHistory } = useBuilderStore();

  if (!layout || !selectedNodeId) {
    return (
      <div className="h-full p-4 text-gray-500 text-sm">
        <p>Select a component to edit its properties.</p>
      </div>
    );
  }

  const node = findNode(layout.children, selectedNodeId);
  if (!node) {
    return (
      <div className="h-full p-4 text-gray-500 text-sm">
        <p>Component not found.</p>
      </div>
    );
  }

  const props = node.props || {};

  const handleChange = (key: string, value: unknown) => {
    pushHistory();
    updateNodeProps(selectedNodeId, { [key]: value });
  };

  const simpleProps = Object.entries(props).filter(
    ([_, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
  );

  return (
    <div className="h-full overflow-y-auto p-4">
      <h3 className="text-sm font-semibold text-white mb-3">{node.type}</h3>
      <div className="space-y-3">
        {simpleProps.map(([key, value]) => (
          <div key={key}>
            <label className="block text-xs text-gray-400 mb-1">{key}</label>
            <input
              type="text"
              value={String(value)}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors duration-200"
            />
          </div>
        ))}
        {simpleProps.length === 0 && (
          <p className="text-xs text-gray-500">No editable props.</p>
        )}
      </div>
    </div>
  );
}
