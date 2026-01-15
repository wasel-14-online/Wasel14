import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Performance optimization hooks and utilities

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Lazy loading component
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export function LazyLoad({
  children,
  fallback = null,
  rootMargin = '50px',
  threshold = 0.1,
  className,
}: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { hasIntersected } = useIntersectionObserver(ref, {
    rootMargin,
    threshold,
  });

  useEffect(() => {
    if (hasIntersected && !isLoaded) {
      setIsLoaded(true);
    }
  }, [hasIntersected, isLoaded]);

  return (
    <div ref={ref} className={className}>
      {isLoaded ? children : fallback}
    </div>
  );
}

// Memoization hook with deep comparison
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const memoizedValue = useMemo(factory, deps);

  // For objects and arrays, we could add deep comparison here
  // For now, this is a basic implementation
  return memoizedValue;
}

// Virtual scrolling hook
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    return {
      start: Math.max(0, start - overscan),
      end,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [items, visibleRange]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: handleScroll,
  };
}

// Image optimization hook
export function useOptimizedImage(src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}) {
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();

    img.onload = () => {
      setIsLoading(false);
      setOptimizedSrc(src);
    };

    img.onerror = () => {
      setIsLoading(false);
      setError('Failed to load image');
    };

    // For now, just use the original src
    // In a real implementation, you would construct an optimized URL
    // based on the options (e.g., using a CDN or image optimization service)
    img.src = src;
  }, [src, options]);

  return { optimizedSrc, isLoading, error };
}

// Bundle splitting and dynamic imports
export function useDynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loadingComponent?: React.ComponentType;
    errorComponent?: React.ComponentType<{ error: Error }>;
  }
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    importFn()
      .then((module) => {
        setComponent(() => module.default);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [importFn]);

  if (error && options?.errorComponent) {
    const ErrorComponent = options.errorComponent;
    return { Component: () => <ErrorComponent error={error} />, isLoading: false, error };
  }

  if (isLoading && options?.loadingComponent) {
    const LoadingComponent = options.loadingComponent;
    return { Component: LoadingComponent, isLoading, error: null };
  }

  return { Component, isLoading, error };
}

// Resource preloading
export const preload = {
  image: (src: string) => {
    const img = new Image();
    img.src = src;
  },

  script: (src: string) => {
    const script = document.createElement('link');
    script.rel = 'preload';
    script.as = 'script';
    script.href = src;
    document.head.appendChild(script);
  },

  style: (href: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  },

  font: (href: string, options?: { type?: string; crossOrigin?: string }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = href;
    if (options?.type) link.type = options.type;
    if (options?.crossOrigin) link.crossOrigin = options.crossOrigin;
    document.head.appendChild(link);
  },
};

// Performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const renderTime = now - lastRenderTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times, last render took ${renderTime}ms`);
    }

    lastRenderTime.current = now;
  });

  return { renderCount: renderCount.current };
}

// Memory usage monitoring (for debugging)
export function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage({
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        });
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage();

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}
