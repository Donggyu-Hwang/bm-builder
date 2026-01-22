/**
 * Accessible Input Component
 * WCAG 2.1 Level AA Compliant
 */

import { forwardRef, InputHTMLAttributes } from 'react';
import { generateId } from '../../utils/accessibility';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      isRequired = false,
      fullWidth = true,
      id,
      className = '',
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const inputId = id || generateId('input');
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const describedBy = [
      errorId,
      helperId,
      ariaDescribedBy,
    ]
      .filter(Boolean)
      .join(' ');

    const baseStyles = 'px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

    const stateStyles = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500';

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-900 mb-1.5"
          >
            {label}
            {isRequired && (
              <span className="text-red-600 ml-1" aria-label="필수 항목">
                *
              </span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`${baseStyles} ${stateStyles} ${widthStyles} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={isRequired}
          aria-describedby={describedBy || undefined}
          {...props}
        />

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-red-600 font-medium"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-slate-600"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
