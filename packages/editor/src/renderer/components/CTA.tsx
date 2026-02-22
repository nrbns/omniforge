'use client';

import React from 'react';

export interface CTAProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function CTA({
  title = 'Ready to get started?',
  subtitle = 'Join thousands of builders creating amazing apps with AI.',
  buttonLabel = 'Start Building',
  className = '',
  children,
}: CTAProps) {
  return (
    <section
      className={`py-16 px-6 bg-primary-600 text-center ${className}`}
    >
      <div className="max-w-2xl mx-auto">
        {children || (
          <>
            <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
            <p className="text-white/90 mb-8">{subtitle}</p>
            <button className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {buttonLabel}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
