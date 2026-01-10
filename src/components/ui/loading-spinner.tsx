import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from './utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'muted';
  className?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantClasses = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  muted: 'text-muted-foreground/60',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  className,
  text,
  fullScreen = false,
  overlay = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        'flex items-center justify-center gap-2',
        fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        overlay && 'absolute inset-0 z-10 bg-background/60 backdrop-blur-sm rounded-lg',
        className
      )}
      role="status"
      aria-label={text || 'Loading'}
    >
      <Loader2
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {text && (
        <span className={cn('text-sm', variantClasses[variant])}>
          {text}
        </span>
      )}
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );

  if (fullScreen || overlay) {
    return spinner;
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {spinner}
    </div>
  );
}

// Specialized loading components
export function PageLoadingSpinner({ text = 'Loading page...' }: { text?: string }) {
  return (
    <LoadingSpinner
      size="xl"
      variant="primary"
      fullScreen
      text={text}
      className="flex-col"
    />
  );
}

export function InlineLoadingSpinner({ size = 'sm', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  return <LoadingSpinner size={size} text={text} />;
}

export function ButtonLoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return <Loader2 className={cn('animate-spin', sizeClasses[size])} />;
}

export function RefreshLoadingSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <RefreshCw
      className={cn('animate-spin', sizeClasses[size], className)}
      aria-label="Refreshing"
    />
  );
}