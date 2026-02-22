'use client';

import React from 'react';

export interface FooterProps {
  brand?: string;
  links?: Array<{ label: string; href?: string }>;
  copyright?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Footer({
  brand = 'Brand',
  links = [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  copyright = `© ${new Date().getFullYear()} ${brand}. All rights reserved.`,
  className = '',
  children,
}: FooterProps) {
  return (
    <footer
      className={`py-8 px-6 bg-gray-900 text-gray-400 ${className}`}
    >
      {children || (
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-white">{brand}</span>
          <div className="flex gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href || '#'}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <span className="text-sm">{copyright}</span>
        </div>
      )}
    </footer>
  );
}
