'use client';

import { Toaster } from 'sonner';
import { ErrorBoundary } from './ErrorBoundary';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
      <Toaster position="top-right" richColors />
    </ErrorBoundary>
  );
}

