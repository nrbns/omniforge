'use client';

import { Component, type ReactNode } from 'react';
import { useBuilderStore } from '../../stores/builder-store';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export class PreviewErrorBoundary extends Component<Props, { hasError: boolean; error?: Error }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    useBuilderStore.getState().setPreviewError(error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900/90 text-red-400 p-4">
            <p className="text-sm font-medium">Preview error</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md">{this.state.error?.message}</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
