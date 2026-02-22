'use client';

import React from 'react';

export interface FeatureGridProps {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  children?: React.ReactNode;
  className?: string;
}

export function FeatureGrid({
  title = 'Features',
  subtitle = 'Everything you need to build amazing applications',
  columns = 3,
  children,
  className = '',
}: FeatureGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns];

  return (
    <section className={`py-16 px-6 bg-white ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className={`grid gap-8 ${gridCols}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
