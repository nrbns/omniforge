'use client';

import React from 'react';
import { ComponentRenderer } from './ComponentRenderer';
import type { LayoutNode, PageLayout } from '../schema';

export interface CanvasProps {
  layout: LayoutNode | PageLayout;
  className?: string;
}

export function Canvas({ layout, className = '' }: CanvasProps) {
  const isPage = layout.type === 'page';
  const nodes = isPage ? (layout as PageLayout).children : [layout];

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {nodes.map((node, i) => (
        <ComponentRenderer key={node.id || i} node={node} />
      ))}
    </div>
  );
}
