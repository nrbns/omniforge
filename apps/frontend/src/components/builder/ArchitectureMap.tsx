'use client';

import { useBuilderStore } from '../../stores/builder-store';
import type { LayoutNode } from '@omniforge/editor';

function NodeTree({ node, depth = 0 }: { node: LayoutNode; depth?: number }) {
  return (
    <div className="ml-2 border-l border-white/10 pl-2" style={{ marginLeft: depth * 8 }}>
      <div className="text-xs font-medium text-violet-300">
        {node.type}
        {node.id && <span className="text-gray-500 ml-1">#{node.id.slice(0, 8)}</span>}
      </div>
      {node.children?.map((child, i) => (
        <NodeTree key={child.id || i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function ArchitectureMap() {
  const { layout, pages } = useBuilderStore();

  return (
    <div className="p-3 space-y-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Architecture</h3>

      <div>
        <div className="text-xs font-medium text-cyan-400 mb-2">Pages</div>
        <div className="space-y-1">
          {pages.map((p) => (
            <div key={p.id} className="text-xs text-gray-300">
              {p.name} <span className="text-gray-500">({p.path})</span>
            </div>
          ))}
          {pages.length === 0 && <div className="text-xs text-gray-500">No pages</div>}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-cyan-400 mb-2">Components</div>
        {layout?.children?.length ? (
          layout.children.map((node, i) => <NodeTree key={node.id || i} node={node} />)
        ) : (
          <div className="text-xs text-gray-500">No components</div>
        )}
      </div>

      <div>
        <div className="text-xs font-medium text-cyan-400 mb-2">APIs</div>
        <div className="text-xs text-gray-500">Add from AppSpec</div>
      </div>

      <div>
        <div className="text-xs font-medium text-cyan-400 mb-2">DB Schema</div>
        <div className="text-xs text-gray-500">Add from AppSpec</div>
      </div>
    </div>
  );
}
