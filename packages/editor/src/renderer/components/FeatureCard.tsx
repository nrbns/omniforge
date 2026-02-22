'use client';

import React from 'react';

export interface FeatureCardProps {
  icon?: string;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FeatureCard({
  icon = '✨',
  title = 'Feature',
  description = 'Describe your feature here.',
  className = '',
  children,
}: FeatureCardProps) {
  return (
    <div
      className={`p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {children || (
        <>
          <div className="text-3xl mb-4">{icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </>
      )}
    </div>
  );
}
