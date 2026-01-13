import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Dialog({ open, onClose, children, title, description }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">
        {/* Header */}
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h2 className="text-lg font-semibold">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>;
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{children}</div>;
}
