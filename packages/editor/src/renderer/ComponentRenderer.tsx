'use client';

import React from 'react';
import { getComponent } from './registry';
import type { LayoutNode } from '../schema';

export interface ComponentRendererProps {
  node: LayoutNode;
}

export function ComponentRenderer({ node }: ComponentRendererProps) {
  const Component = getComponent(node.type);
  const props = { ...(node.props || {}), __nodeType: node.type } as Record<string, unknown>;
  const children = node.children?.length
    ? node.children.map((child, i) => (
        <ComponentRenderer key={child.id || i} node={child} />
      ))
    : undefined;

  return <Component {...props}>{children}</Component>;
}
