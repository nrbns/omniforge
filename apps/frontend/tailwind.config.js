/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/editor/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Premium builder theme (OmniForge dark)
        builder: {
          base: '#0b0f17',
          surface: '#111827',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        'gradient-glow': 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(6,182,212,0.2) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.2)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.3)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.3)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

