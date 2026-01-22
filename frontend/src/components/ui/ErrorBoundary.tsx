import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component with Friendly Messages
 * Catches JavaScript errors anywhere in the child component tree
 * and displays helpful, emotional error messages
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-cream dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-orange-100 dark:border-orange-900">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-100 dark:bg-orange-900/30 rounded-full blur-2xl" />
                  <div className="relative bg-orange-100 dark:bg-orange-900/30 rounded-full p-6">
                    <AlertCircle className="w-16 h-16 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Main Message */}
              <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
                Oops! Something went wrong
              </h1>

              <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-8">
                We hit a snag, but don't worry! Your work is safe. Let's get you back on track.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <Home className="w-5 h-5" />
                  Go to Dashboard
                </button>
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-8">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Technical Details (Development Only)
                  </summary>
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Helpful Tips */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Here are some things you can try:
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Refresh the page to restart the app</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache and try again</li>
                  <li>• If the problem persists, please contact our support team</li>
                </ul>
              </div>

              {/* Contact Support */}
              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Need help? Contact us at{' '}
                <a
                  href="mailto:support@bm-builder.com"
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                >
                  support@bm-builder.com
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simpler error fallback for inline errors
 */
interface InlineErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export const InlineErrorFallback: React.FC<InlineErrorFallbackProps> = ({
  message = 'Something went wrong',
  onRetry
}) => (
  <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
    <p className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
      Oops! {message}
    </p>
    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
      Let's give that another try.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    )}
  </div>
);

/**
 * Hook for handling async errors with friendly messages
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err);
    } else {
      setError(new Error(String(err)));
    }
  }, []);

  const reset = React.useCallback(() => {
    setError(null);
  }, []);

  // Map error types to friendly messages
  const getFriendlyMessage = (error: Error): { title: string; message: string } => {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        title: 'Connection issue',
        message: 'It looks like we lost our connection. Please check your internet and try again.'
      };
    }

    if (error.message.includes('timeout')) {
      return {
        title: 'Taking longer than usual',
        message: 'This is taking a bit longer than expected. Please wait a moment...'
      };
    }

    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return {
        title: 'Hey there!',
        message: 'Please log in to continue your journey.'
      };
    }

    return {
      title: 'Oops! Something went wrong',
      message: 'Let\'s try that again. If this continues, please reach out to us!'
    };
  };

  return {
    error,
    handleError,
    reset,
    getFriendlyMessage
  };
};
