import React from 'react';
import { Skeleton } from './skeleton';
import { cn } from './utils';

interface SkeletonScreenProps {
  variant?: 'card' | 'list' | 'table' | 'profile' | 'dashboard' | 'form';
  lines?: number;
  className?: string;
  showAvatar?: boolean;
  showImage?: boolean;
}

export function SkeletonScreen({
  variant = 'card',
  lines = 3,
  className,
  showAvatar = false,
  showImage = false
}: SkeletonScreenProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={cn('space-y-3 p-4 border rounded-lg', className)}>
            {showImage && <Skeleton className="h-32 w-full rounded-md" />}
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              {Array.from({ length: lines - 2 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={cn('space-y-4', className)}>
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className={cn('space-y-3', className)}>
            <div className="flex space-x-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-3 flex-1" />
                ))}
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <div className={cn('space-y-4 p-4', className)}>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className={cn('space-y-6 p-4', className)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className={cn('space-y-4 p-4', className)}>
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        );

      default:
        return (
          <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        );
    }
  };

  return (
    <div role="status" aria-label="Loading content">
      {renderSkeleton()}
      <span className="sr-only">Loading...</span>
    </div>
  );
}