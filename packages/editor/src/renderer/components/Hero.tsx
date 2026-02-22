'use client';

import React from 'react';

export interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaSecondaryLabel?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Hero({
  title = 'Build Something Amazing',
  subtitle = 'The world\'s first AI-powered app builder. Transform ideas into production-ready apps in minutes.',
  ctaLabel = 'Get Started',
  ctaSecondaryLabel = 'Learn More',
  background = 'gradient',
  className = '',
  children,
}: HeroProps) {
  const isGradient = background === 'gradient';
  const bgClass = isGradient
    ? 'bg-gradient-to-br from-primary-500 to-primary-700'
    : 'bg-gray-50';
  const textClass = isGradient ? 'text-white' : 'text-gray-900';
  const subTextClass = isGradient ? 'text-white/90' : 'text-gray-600';
  const secondaryBtnClass = isGradient
    ? 'border-2 border-white text-white hover:bg-white/10'
    : 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50';

  return (
    <section
      className={`py-20 px-6 text-center ${bgClass} ${className}`}
    >
      <div className="max-w-3xl mx-auto">
        {children || (
          <>
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${textClass}`}>
              {title}
            </h1>
            <p className={`text-lg mb-8 ${subTextClass}`}>
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                {ctaLabel}
              </button>
              <button className={`px-6 py-3 rounded-lg font-semibold transition-colors ${secondaryBtnClass}`}>
                {ctaSecondaryLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
