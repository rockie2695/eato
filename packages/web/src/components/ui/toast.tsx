import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border',
        success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800',
        destructive: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800',
        warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800',
        info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  onClose?: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  duration?: number;
}

const icons = {
  default: null,
  success: <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />,
  destructive: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
};

function Toast({ className, variant = 'default', onClose, title, description, icon, ...props }: ToastProps) {
  return (
    <div
      className={cn(toastVariants({ variant }), 'animate-slide-up', className)}
      {...props}
    >
      {icon || (variant ? icons[variant] : null)}
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-80 mt-0.5">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Toast Container
interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

export { Toast, ToastContainer, toastVariants };
export type { ToastProps };
