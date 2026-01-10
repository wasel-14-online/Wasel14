import React, { useEffect, useRef } from 'react';
import { cn } from './utils';

// Accessibility utilities and hooks
export const a11y = {
  // Screen reader only text
  srOnly: 'sr-only',

  // Focus management
  focusable: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',

  // Skip links
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50',

  // High contrast mode detection
  prefersHighContrast: () => window.matchMedia('(prefers-contrast: high)').matches,

  // Reduced motion detection
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // Color scheme detection
  prefersDarkMode: () => window.matchMedia('(prefers-color-scheme: dark)').matches,

  // Keyboard navigation detection
  isKeyboardNavigation: () => {
    return document.body.classList.contains('keyboard-navigation');
  },
};

// Custom hooks for accessibility
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}

export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0] as HTMLElement;
      lastFocusableRef.current = focusableElements[focusableElements.length - 1] as HTMLElement;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          event.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          event.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef]);

  return { firstFocusableRef, lastFocusableRef };
}

export function useAnnouncer() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
}

// Accessible components
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a href={href} className={cn(a11y.skipLink, className)}>
      {children}
    </a>
  );
}

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
}

export function AccessibleButton({
  children,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  ...props
}: AccessibleButtonProps) {
  return (
    <button
      className={cn(a11y.focusable, className)}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      {...props}
    >
      {children}
    </button>
  );
}

interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function AccessibleDialog({
  isOpen,
  onClose,
  title,
  children,
  description
}: AccessibleDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      ref={dialogRef}
      tabIndex={-1}
    >
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h2 id="dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className={cn(a11y.focusable, 'p-1 rounded-md hover:bg-muted')}
          >
            ×
          </button>
        </div>
        {description && (
          <p id="dialog-description" className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

// Form accessibility helpers
export const formA11y = {
  // Required field indicator
  required: (required?: boolean) => required ? { 'aria-required': true } : {},

  // Error message association
  error: (errorId?: string) => errorId ? { 'aria-describedby': errorId } : {},

  // Field description
  describedBy: (descriptionId?: string) => descriptionId ? { 'aria-describedby': descriptionId } : {},
};

// List accessibility
interface AccessibleListProps {
  items: Array<{
    id: string;
    content: React.ReactNode;
    isSelected?: boolean;
  }>;
  onSelect?: (id: string) => void;
  role?: 'listbox' | 'menu' | 'list';
  multiSelect?: boolean;
  className?: string;
}

export function AccessibleList({
  items,
  onSelect,
  role = 'list',
  multiSelect = false,
  className
}: AccessibleListProps) {
  const listRole = role === 'list' ? 'list' : role;
  const itemRole = role === 'listbox' ? 'option' : role === 'menu' ? 'menuitem' : 'listitem';

  return (
    <ul role={listRole} className={className}>
      {items.map((item) => (
        <li
          key={item.id}
          role={itemRole}
          aria-selected={item.isSelected}
          tabIndex={onSelect ? 0 : -1}
          onClick={() => onSelect?.(item.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect?.(item.id);
            }
          }}
          className={cn(
            a11y.focusable,
            'cursor-pointer p-2 rounded-md',
            item.isSelected && 'bg-primary text-primary-foreground'
          )}
        >
          {item.content}
        </li>
      ))}
    </ul>
  );
}

// Progress indicator with screen reader support
interface AccessibleProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function AccessibleProgress({
  value,
  max = 100,
  label = 'Progress',
  showValue = true,
  className
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="w-full bg-muted rounded-full h-2"
      >
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="sr-only" aria-live="polite">
          {label}: {percentage}% complete
        </div>
      )}
    </div>
  );
}