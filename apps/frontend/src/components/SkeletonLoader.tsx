'use client';

/**
 * Skeleton Loader Component
 * Shows loading state for AI streaming, data fetching, etc.
 */
interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'code' | 'chart' | 'shimmer';
  lines?: number;
  className?: string;
}

export function SkeletonLoader({ variant = 'text', lines = 3, className = '' }: SkeletonLoaderProps) {
  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded animate-pulse"
            style={{ width: i === lines - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-lg shadow p-4 space-y-3 ${className}`}>
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
      </div>
    );
  }

  if (variant === 'code') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mb-4" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (variant === 'shimmer') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded shimmer bg-gray-800/80"
            style={{ width: i === lines - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return null;
}

/**
 * Streaming Code Skeleton
 * Shows typing animation for AI code generation
 */
export function StreamingCodeSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-purple-100 rounded animate-pulse w-3/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-purple-100 rounded animate-pulse w-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-purple-100 rounded animate-pulse w-5/6" />
          <div className="mt-1 flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-xs text-purple-600">AI is generating...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

