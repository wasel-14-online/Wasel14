import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

class ToastNotification {
  private static getIcon(type: ToastType) {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return null;
    }
  }

  static show(
    type: ToastType,
    title: string,
    options: ToastOptions = {}
  ) {
    const { description, duration, action, onDismiss, onAutoClose } = options;

    const toastOptions = {
      duration: duration || (type === 'loading' ? Infinity : 4000),
      onDismiss,
      onAutoClose,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    };

    switch (type) {
      case 'success':
        return toast.success(title, {
          description,
          icon: this.getIcon(type),
          ...toastOptions,
        });

      case 'error':
        return toast.error(title, {
          description,
          icon: this.getIcon(type),
          ...toastOptions,
        });

      case 'warning':
        return toast.warning(title, {
          description,
          icon: this.getIcon(type),
          ...toastOptions,
        });

      case 'info':
        return toast.info(title, {
          description,
          icon: this.getIcon(type),
          ...toastOptions,
        });

      case 'loading':
        return toast.loading(title, {
          description,
          icon: this.getIcon(type),
          ...toastOptions,
        });

      default:
        return toast(title, {
          description,
          ...toastOptions,
        });
    }
  }

  // Convenience methods
  static success(title: string, options?: ToastOptions) {
    return this.show('success', title, options);
  }

  static error(title: string, options?: ToastOptions) {
    return this.show('error', title, options);
  }

  static warning(title: string, options?: ToastOptions) {
    return this.show('warning', title, options);
  }

  static info(title: string, options?: ToastOptions) {
    return this.show('info', title, options);
  }

  static loading(title: string, options?: ToastOptions) {
    return this.show('loading', title, options);
  }

  // Update existing toast
  static update(toastId: string | number, type: ToastType, title: string, options?: ToastOptions) {
    const { description } = options || {};

    toast.loading(title, {
      id: toastId,
      description,
      icon: this.getIcon(type),
    });
  }

  // Dismiss toast
  static dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  // Dismiss all toasts
  static dismissAll() {
    toast.dismiss();
  }

  // Promise toast
  static promise<T>(
    promise: Promise<T>,
    {
      loading = 'Loading...',
      success = 'Success!',
      error = 'Something went wrong',
      description,
    }: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: any) => string);
      description?: string;
    } = {}
  ) {
    return toast.promise(promise, {
      loading,
      success,
      error,
      description,
    });
  }
}

// Export the class and convenience functions
export { ToastNotification };

// Export convenience functions at module level
export const showToast = ToastNotification.show.bind(ToastNotification);
export const showSuccessToast = ToastNotification.success.bind(ToastNotification);
export const showErrorToast = ToastNotification.error.bind(ToastNotification);
export const showWarningToast = ToastNotification.warning.bind(ToastNotification);
export const showInfoToast = ToastNotification.info.bind(ToastNotification);
export const showLoadingToast = ToastNotification.loading.bind(ToastNotification);
export const updateToast = ToastNotification.update.bind(ToastNotification);
export const dismissToast = ToastNotification.dismiss.bind(ToastNotification);
export const dismissAllToasts = ToastNotification.dismissAll.bind(ToastNotification);
export const promiseToast = ToastNotification.promise.bind(ToastNotification);