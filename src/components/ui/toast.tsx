'use client';

import { CheckCircle2, CircleAlert, Info, X, XCircle } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { clsx } from 'clsx';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Set to 0 to keep the toast visible until it is dismissed. */
  duration?: number;
};

type Toast = ToastInput & {
  id: string;
  variant: ToastVariant;
  duration: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconClassName: string }
> = {
  success: { icon: CheckCircle2, iconClassName: 'text-emerald-600' },
  error: { icon: XCircle, iconClassName: 'text-red-600' },
  info: { icon: Info, iconClassName: 'text-indigo-600' },
  warning: { icon: CircleAlert, iconClassName: 'text-amber-600' },
};

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  useEffect(() => {
    if (toast.duration <= 0) return;

    const timeout = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timeout);
  }, [dismiss, toast.duration, toast.id]);

  const { icon: Icon, iconClassName } = toastStyles[toast.variant];

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className="flex w-full items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg"
    >
      <Icon className={clsx('mt-0.5 h-5 w-5 shrink-0', iconClassName)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-zinc-600">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="-mr-1 -mt-1 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = crypto.randomUUID();
    setToasts((currentToasts) => [
      ...currentToasts,
      {
        ...input,
        id,
        variant: input.variant ?? 'info',
        duration: input.duration ?? 5000,
      },
    ]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
      >
        {toasts.map((currentToast) => (
          <div key={currentToast.id} className="pointer-events-auto">
            <ToastItem toast={currentToast} dismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
