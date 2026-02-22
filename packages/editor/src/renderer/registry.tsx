'use client';

import React from 'react';
import {
  Navbar,
  Hero,
  FeatureGrid,
  FeatureCard,
  CTA,
  Footer,
} from './components';
import type { LayoutNode } from '../schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentRegistry = Record<string, React.ComponentType<any>>;

const registry: ComponentRegistry = {
  Navbar: Navbar as React.ComponentType<{ [key: string]: unknown; children?: React.ReactNode }>,
  Hero: Hero as React.ComponentType<{ [key: string]: unknown; children?: React.ReactNode }>,
  FeatureGrid: FeatureGrid as React.ComponentType<{ [key: string]: unknown; children?: React.ReactNode }>,
  FeatureCard: FeatureCard as React.ComponentType<{ [key: string]: unknown; children?: React.ReactNode }>,
  CTA: CTA as React.ComponentType<{ [key: string]: unknown; children?: React.ReactNode }>,
  Footer: Footer as React.ComponentType<{ [key: string]: unknown; children?: React.ReactNode }>,
  Container: ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
    <div className={`max-w-6xl mx-auto px-6 ${className}`}>{children}</div>
  ),
  Section: ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
    <section className={`py-12 ${className}`}>{children}</section>
  ),
  Card: ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
    <div className={`p-6 rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  ),
  Button: ({ label = 'Button', className = '' }: { label?: string; className?: string }) => (
    <button
      className={`px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors ${className}`}
    >
      {label}
    </button>
  ),
  Heading: ({ text = 'Heading', level = 2 }: { text?: string; level?: 1 | 2 | 3 }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return (
      <Tag className={level === 1 ? 'text-4xl font-bold' : level === 2 ? 'text-2xl font-semibold' : 'text-xl font-medium'}>
        {text}
      </Tag>
    );
  },
  Text: ({ text = '' }: { text?: string }) => <p className="text-gray-600">{text}</p>,
  Image: ({ src = '', alt = '' }: { src?: string; alt?: string }) =>
    src ? <img src={src} alt={alt} className="max-w-full h-auto rounded-lg" /> : null,
};

/**
 * Get component from registry. Returns a fallback div for unknown types.
 */
export function getComponent(type: string): React.ComponentType<{ [key: string]: unknown; children?: React.ReactNode }> {
  const Component = registry[type];
  if (Component) return Component;
  return function Fallback({ __nodeType, children, ...rest }: { __nodeType?: string; children?: React.ReactNode; [key: string]: unknown }) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500" data-unknown-type={__nodeType}>
        {__nodeType && <span className="text-xs font-mono">{__nodeType}</span>}
        {children}
      </div>
    );
  };
}

export { registry };
