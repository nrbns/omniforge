'use client';

import React from 'react';

export interface NavbarProps {
  title?: string;
  logo?: string;
  links?: Array<{ label: string; href?: string }>;
  ctaLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Navbar({
  title = 'Brand',
  logo,
  links = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
  ],
  ctaLabel = 'Get Started',
  className = '',
  children,
}: NavbarProps) {
  return (
    <nav
      className={`flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 ${className}`}
    >
      <div className="flex items-center gap-8">
        {logo ? (
          <img src={logo} alt={title} className="h-8" />
        ) : (
          <span className="text-xl font-bold text-gray-900">{title}</span>
        )}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href || '#'}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      {children || (
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
          {ctaLabel}
        </button>
      )}
    </nav>
  );
}
