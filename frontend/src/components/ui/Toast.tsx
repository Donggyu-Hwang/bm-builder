import React, { useEffect, createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Toast Context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Emotional message templates
const getEmotionalMessage = (type: ToastType, title: string): { icon: React.ReactNode; emoji: string } => {
  switch (type) {
    case 'success':
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        emoji: '🎉'
      };
    case 'error':
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        emoji: '😅'
      };
    case 'warning':
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        emoji: '⚠️'
      };
    case 'info':
    default:
      return {
        icon: <Info className="w-5 h-5" />,
        emoji: '💡'
      };
  }
};

// Toast Component
const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const { icon, emoji } = getEmotionalMessage(toast.type, toast.title);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const typeStyles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-900 dark:text-green-100'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-900 dark:text-red-100'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-900 dark:text-yellow-100'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-100'
    }
  };

  const styles = typeStyles[toast.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        ${styles.bg} ${styles.border} ${styles.icon}
        flex items-start gap-3 p-4 rounded-xl shadow-lg border-2
        transform transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        hover:shadow-xl
        min-w-[320px] max-w-md
      `}
    >
      <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label="emoji">
              {emoji}
            </span>
            <h4 className={`font-semibold ${styles.title} text-sm`}>
              {toast.title}
            </h4>
          </div>
          <button
            onClick={handleRemove}
            aria-label="Close notification"
            className={`
              ${styles.icon} flex-shrink-0
              hover:opacity-70 transition-opacity
              p-0.5 rounded hover:bg-black/5
            `}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {toast.message && (
          <p className={`mt-1 text-sm ${styles.title} opacity-80`}>
            {toast.message}
          </p>
        )}
      </div>
    </div>
  );
};

// Toast Container
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Convenience functions for emotional error messages
export const toastSuccess = (title: string, message?: string) => ({
  type: 'success' as ToastType,
  title,
  message
});

export const toastError = (title: string, message?: string) => ({
  type: 'error' as ToastType,
  title,
  message
});

export const toastInfo = (title: string, message?: string) => ({
  type: 'info' as ToastType,
  title,
  message
});

export const toastWarning = (title: string, message?: string) => ({
  type: 'warning' as ToastType,
  title,
  message
});

// Common error message templates
export const ErrorMessages = {
  network: {
    title: 'Oops! Connection issue',
    message: 'It looks like we lost our connection. Let\'s try that again!'
  },
  validation: {
    title: 'Almost there!',
    message: 'Please double-check a few things before we continue.'
  },
  unauthorized: {
    title: 'Hey there!',
    message: 'Please log in to continue your journey.'
  },
  server: {
    title: 'Something went wrong',
    message: 'Our team has been notified. Let\'s try refreshing!'
  },
  timeout: {
    title: 'Taking longer than usual',
    message: 'This is taking a bit longer. Please wait a moment...'
  },
  notFound: {
    title: 'Hmm, can\'t find that',
    message: 'The resource you\'re looking for doesn\'t exist.'
  },
  generic: {
    title: 'Oops! Something went wrong',
    message: 'Let\'s try again. If this continues, please reach out!'
  }
};

// Common success message templates
export const SuccessMessages = {
  created: {
    title: 'Woohoo! Created successfully',
    message: 'Your new item is ready to use!'
  },
  updated: {
    title: 'Great job! Updated successfully',
    message: 'Your changes have been saved.'
  },
  deleted: {
    title: 'Done! Deleted successfully',
    message: 'Everything is cleaned up.'
  },
  saved: {
    title: 'Saved!',
    message: 'Your work is safe and sound.'
  },
  copied: {
    title: 'Copied to clipboard',
    message: 'Ready to paste wherever you need!'
  },
  sent: {
    title: 'Sent successfully',
    message: 'Your message is on its way!'
  }
};
