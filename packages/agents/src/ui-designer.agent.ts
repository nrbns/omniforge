import type { UIPreferences } from '@omniforge/shared';

const TOKEN_PRESETS: Record<string, Record<string, any>> = {
  minimal: {
    colors: { primary: '#18181b', secondary: '#71717a', success: '#22c55e', error: '#ef4444', warning: '#f59e0b' },
    radii: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
    shadows: { sm: 'none', md: '0 1px 2px rgba(0,0,0,0.05)', lg: '0 2px 4px rgba(0,0,0,0.05)' },
    fontFamily: 'Inter, sans-serif',
  },
  'modern-saas': {
    colors: { primary: '#3b82f6', secondary: '#8b5cf6', success: '#10b981', error: '#ef4444', warning: '#f59e0b' },
    radii: { sm: '0.375rem', md: '0.5rem', lg: '1rem' },
    shadows: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)', lg: '0 10px 15px rgba(0,0,0,0.1)' },
    fontFamily: 'Inter, sans-serif',
  },
  glassmorphism: {
    colors: { primary: '#8b5cf6', secondary: '#a78bfa', success: '#34d399', error: '#f87171', warning: '#fbbf24' },
    radii: { sm: '0.75rem', md: '1rem', lg: '1.5rem' },
    shadows: { sm: '0 4px 30px rgba(0,0,0,0.1)', md: '0 8px 32px rgba(0,0,0,0.12)', lg: '0 12px 40px rgba(0,0,0,0.15)' },
    fontFamily: 'Inter, sans-serif',
  },
  luxury: {
    colors: { primary: '#b45309', secondary: '#92400e', success: '#059669', error: '#dc2626', warning: '#d97706' },
    radii: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.08)', md: '0 4px 12px rgba(0,0,0,0.1)', lg: '0 12px 24px rgba(0,0,0,0.12)' },
    fontFamily: 'Playfair Display, Georgia, serif',
  },
  'dark-first': {
    colors: { primary: '#818cf8', secondary: '#a5b4fc', success: '#34d399', error: '#f87171', warning: '#fbbf24' },
    radii: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem' },
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.3)', md: '0 4px 12px rgba(0,0,0,0.4)', lg: '0 12px 24px rgba(0,0,0,0.5)' },
    fontFamily: 'Inter, sans-serif',
  },
  playful: {
    colors: { primary: '#ec4899', secondary: '#8b5cf6', success: '#22c55e', error: '#ef4444', warning: '#f59e0b' },
    radii: { sm: '0.75rem', md: '1rem', lg: '1.5rem' },
    shadows: { sm: '0 2px 8px rgba(0,0,0,0.1)', md: '0 4px 16px rgba(0,0,0,0.12)', lg: '0 8px 24px rgba(0,0,0,0.15)' },
    fontFamily: 'Nunito, sans-serif',
  },
};

export class UIDesignerAgent {
  /**
   * Generates design tokens from spec (respects uiPreferences when present)
   */
  async generateTokens(spec: any): Promise<Record<string, any>> {
    const prefs = spec?.uiPreferences as UIPreferences | undefined;
    const style = prefs?.style || 'modern-saas';
    const preset = TOKEN_PRESETS[style] || TOKEN_PRESETS['modern-saas'];

    return {
      colors: {
        primary: spec?.ui?.primaryColor || preset.colors.primary,
        secondary: preset.colors.secondary,
        success: preset.colors.success,
        error: preset.colors.error,
        warning: preset.colors.warning,
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      typography: {
        fontFamily: preset.fontFamily || 'Inter, sans-serif',
        fontSize: { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' },
      },
      radii: preset.radii || { sm: '0.25rem', md: '0.5rem', lg: '1rem' },
      shadows: preset.shadows || {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
      },
    };
  }

  async exportToFigma(tokens: Record<string, any>): Promise<string> {
    // TODO: Generate Figma plugin JSON
    return JSON.stringify(tokens, null, 2);
  }
}

