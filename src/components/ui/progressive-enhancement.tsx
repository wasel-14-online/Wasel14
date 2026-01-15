import React, { useState, useEffect, ReactNode } from 'react';
import { SkeletonScreen } from './skeleton-screen';
import { LoadingSpinner } from './loading-spinner';
import { ErrorBoundary } from '../ErrorBoundary';

interface ProgressiveEnhancementProps {
  children: ReactNode;
  fallback: ReactNode;
  enhanced: ReactNode;
  loadingComponent?: ReactNode;
  errorFallback?: ReactNode;
  enhancementCondition?: () => boolean | Promise<boolean>;
  delay?: number;
  skeletonVariant?: 'card' | 'list' | 'table' | 'profile' | 'dashboard' | 'form';
  onEnhancementLoad?: () => void;
  onEnhancementError?: (error: Error) => void;
}

export function ProgressiveEnhancement({
  children,
  fallback,
  enhanced,
  loadingComponent,
  errorFallback,
  enhancementCondition,
  delay = 0,
  skeletonVariant = 'card',
  onEnhancementLoad,
  onEnhancementError,
}: ProgressiveEnhancementProps) {
  const [enhancementState, setEnhancementState] = useState<'loading' | 'ready' | 'error' | 'fallback'>('loading');
  const [isEnhanced, setIsEnhanced] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const checkEnhancement = async () => {
      try {
        // Check if enhancement condition is met
        const shouldEnhance = enhancementCondition ? await enhancementCondition() : true;

        if (!isMounted) return;

        if (shouldEnhance) {
          // Add delay if specified
          if (delay > 0) {
            timeoutId = setTimeout(() => {
              if (isMounted) {
                setIsEnhanced(true);
                setEnhancementState('ready');
                onEnhancementLoad?.();
              }
            }, delay);
          } else {
            setIsEnhanced(true);
            setEnhancementState('ready');
            onEnhancementLoad?.();
          }
        } else {
          setEnhancementState('fallback');
        }
      } catch (error) {
        if (isMounted) {
          setEnhancementState('error');
          onEnhancementError?.(error as Error);
        }
      }
    };

    checkEnhancement();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enhancementCondition, delay, onEnhancementLoad, onEnhancementError]);

  // Render based on state
  switch (enhancementState) {
    case 'loading':
      return loadingComponent || <SkeletonScreen variant={skeletonVariant} />;

    case 'ready':
      return isEnhanced ? (
        <ErrorBoundary fallback={errorFallback}>
          {enhanced}
        </ErrorBoundary>
      ) : (
        fallback
      );

    case 'error':
      return errorFallback || fallback;

    case 'fallback':
    default:
      return fallback;
  }
}

// Hook for progressive enhancement
export function useProgressiveEnhancement(
  enhancementCondition?: () => boolean | Promise<boolean>,
  delay = 0
) {
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const checkEnhancement = async () => {
      try {
        const shouldEnhance = enhancementCondition ? await enhancementCondition() : true;

        if (!isMounted) return;

        if (delay > 0) {
          timeoutId = setTimeout(() => {
            if (isMounted) {
              setIsEnhanced(shouldEnhance);
              setIsLoading(false);
            }
          }, delay);
        } else {
          setIsEnhanced(shouldEnhance);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    checkEnhancement();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enhancementCondition, delay]);

  return { isEnhanced, isLoading, error };
}

// Component for lazy loading with progressive enhancement
interface LazyProgressiveProps {
  children: ReactNode;
  fallback: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  delay?: number;
}

export function LazyProgressive({
  children,
  fallback,
  loadingComponent,
  errorComponent,
  delay = 100,
}: LazyProgressiveProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (hasError) {
    return errorComponent || <div className="text-destructive">Failed to load component</div>;
  }

  if (!isLoaded) {
    return loadingComponent || <LoadingSpinner size="sm" />;
  }

  return (
    <ErrorBoundary
      fallback={errorComponent}
      onError={() => setHasError(true)}
    >
      {children}
    </ErrorBoundary>
  );
}

// Feature detection utilities
export const featureDetection = {
  // Check if WebGL is supported
  webgl: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch (e) {
      return false;
    }
  },

  // Check if Service Workers are supported
  serviceWorker: () => 'serviceWorker' in navigator,

  // Check if WebRTC is supported
  webrtc: () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),

  // Check if IndexedDB is supported
  indexedDB: () => !!(window.indexedDB || (window as any).mozIndexedDB || (window as any).webkitIndexedDB || (window as any).msIndexedDB),

  // Check if localStorage is supported
  localStorage: () => {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Check if the device is online
  online: () => navigator.onLine,

  // Check if the device supports touch
  touch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,

  // Check if the device has a high DPI screen
  highDPI: () => window.devicePixelRatio > 1,

  // Check if the browser supports CSS Grid
  cssGrid: () => CSS.supports('display', 'grid'),

  // Check if the browser supports CSS Custom Properties
  cssCustomProperties: () => CSS.supports('--custom-property', 'value'),
};
