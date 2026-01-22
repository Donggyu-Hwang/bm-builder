import React from 'react';

/**
 * Skeleton Component for Loading States
 * Provides visual feedback while content is loading
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%')
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  );
};

/**
 * Text Skeleton - for paragraphs and headings
 */
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '70%' : '100%'}
      />
    ))}
  </div>
);

/**
 * Card Skeleton - for card components
 */
export const CardSkeleton: React.FC<{ className?: string; showAvatar?: boolean }> = ({
  className = '',
  showAvatar = false
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
    {showAvatar && (
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={14} className="mt-2" />
        </div>
      </div>
    )}
    <TextSkeleton lines={3} />
  </div>
);

/**
 * List Skeleton - for list items
 */
export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({
  items = 3,
  className = ''
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Table Skeleton - for data tables
 */
export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className = ''
}) => (
  <div className={`w-full ${className}`}>
    {/* Header */}
    <div className="flex gap-4 mb-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" width="20%" height={20} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-3 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} variant="text" width="20%" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Document Skeleton - for document preview
 */
export const DocumentSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton variant="text" width="40%" height={24} className="mb-2" />
        <Skeleton variant="text" width="60%" height={16} />
      </div>
      <Skeleton variant="rectangular" width={24} height={24} />
    </div>
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton variant="rectangular" width={60} height={60} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="90%" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton variant="rectangular" width={60} height={60} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="85%" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Progress Indicator Component
 */
interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  label,
  className = '',
  color = 'primary'
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    primary: 'bg-orange-500',
    secondary: 'bg-pink-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress bar'}
      >
        <div
          className={`${colorClasses[color]} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Spinner Component - for loading states
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'current';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-orange-500',
    secondary: 'text-pink-500',
    current: 'text-current'
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Optimistic UI Update Hook
 */
export const useOptimisticUpdate = <T,>(
  items: T[],
  updateFn: (item: T) => Promise<T>,
  options: { rollbackOnError?: boolean } = {}
) => {
  const [optimisticItems, setOptimisticItems] = React.useState<T[]>(items);
  const [pendingIds, setPendingIds] = React.useState<Set<string>>(new Set());

  const updateItem = async (item: T, tempId: string) => {
    // Optimistically update
    setOptimisticItems((prev) => [...prev, item]);
    setPendingIds((prev) => new Set(prev).add(tempId));

    try {
      const result = await updateFn(item);
      // Replace optimistic item with real result
      setOptimisticItems((prev) =>
        prev.map((i) => (i === item ? result : i))
      );
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
      return result;
    } catch (error) {
      if (options.rollbackOnError) {
        // Rollback on error
        setOptimisticItems((prev) => prev.filter((i) => i !== item));
      }
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
      throw error;
    }
  };

  return {
    items: optimisticItems,
    updateItem,
    isPending: (tempId: string) => pendingIds.has(tempId)
  };
};
