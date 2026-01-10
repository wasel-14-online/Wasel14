import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { LoadingSpinner } from './ui/loading-spinner';
import { showErrorToast, showSuccessToast } from './ui/toast-notification';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  lastErrorTime: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
    isRetrying: false,
    lastErrorTime: Date.now(),
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableRetry = true, maxRetries = 3 } = this.props;

    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Report error to analytics/error reporting service
    this.reportError(error, errorInfo);

    // Show error toast
    showErrorToast('An error occurred', {
      description: 'Please try again or contact support if the problem persists.',
    });

    // Auto-retry for certain types of errors
    if (enableRetry && this.shouldAutoRetry(error)) {
      this.scheduleRetry();
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    // Retry for network errors, but not for syntax errors or other critical errors
    const errorMessage = error.message.toLowerCase();
    const retryableErrors = ['network', 'timeout', 'fetch', 'connection'];

    return retryableErrors.some(keyword => errorMessage.includes(keyword)) &&
           this.state.retryCount < (this.props.maxRetries || 3);
  }

  private scheduleRetry() {
    const { retryCount } = this.state;
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    const { maxRetries = 3 } = this.props;

    if (retryCount >= maxRetries) {
      return;
    }

    this.setState({ isRetrying: true });

    // Simulate retry attempt
    setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRetrying: false,
      }));

      showSuccessToast('Retrying...', {
        description: 'Attempting to recover from the error.',
      });
    }, 1000);
  };

  private handleReset = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    });

    showSuccessToast('Reset successful', {
      description: 'The application has been reset.',
    });
  };

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // In production, send to error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
    };

    // Example: Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }

    // You could also send to Sentry, LogRocket, etc.
    console.log('Error report:', errorReport);
  }

  private getErrorType(error: Error): 'network' | 'javascript' | 'component' | 'unknown' {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('syntax') || message.includes('reference') || message.includes('type')) {
      return 'javascript';
    }
    if (message.includes('component') || message.includes('render')) {
      return 'component';
    }

    return 'unknown';
  }

  private getErrorSuggestions(errorType: string): string[] {
    switch (errorType) {
      case 'network':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Clear your browser cache',
        ];
      case 'javascript':
        return [
          'Try refreshing the page',
          'Clear your browser cache and cookies',
          'Try using a different browser',
        ];
      case 'component':
        return [
          'Try refreshing the page',
          'Contact support if the problem persists',
        ];
      default:
        return [
          'Try refreshing the page',
          'Contact support for assistance',
        ];
    }
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, isRetrying, retryCount } = this.state;
      const { showErrorDetails = false, maxRetries = 3 } = this.props;
      const errorType = error ? this.getErrorType(error) : 'unknown';
      const suggestions = this.getErrorSuggestions(errorType);

      if (isRetrying) {
        return (
          <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="max-w-lg w-full">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <LoadingSpinner size="lg" className="mb-4" />
                <h3 className="text-lg font-semibold mb-2">Retrying...</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Attempting to recover from the error (attempt {retryCount + 1} of {maxRetries})
                </p>
              </CardContent>
            </Card>
          </div>
        );
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive mb-2">
                {errorType === 'network' ? (
                  <WifiOff className="size-6" />
                ) : (
                  <AlertTriangle className="size-6" />
                )}
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We're sorry, but something unexpected happened. Don't worry, we've been notified and are working to fix it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Type Alert */}
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  Error Type: {errorType.charAt(0).toUpperCase() + errorType.slice(1)} Error
                  {retryCount > 0 && ` (Retry attempts: ${retryCount})`}
                </AlertDescription>
              </Alert>

              {/* Error Details */}
              {showErrorDetails && error && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-mono text-muted-foreground break-all">
                    {error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-sm cursor-pointer text-muted-foreground">
                        Component Stack
                      </summary>
                      <pre className="text-xs mt-2 whitespace-pre-wrap break-all">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Suggestions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">What you can try:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="size-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                  disabled={isRetrying}
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="secondary"
                  className="flex-1"
                >
                  <Home className="size-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Support Contact */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Need help? Contact our support team at{' '}
                  <a
                    href="mailto:support@wassel.app"
                    className="text-primary hover:underline"
                  >
                    support@wassel.app
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
