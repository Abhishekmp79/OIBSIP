/**
 * ToastContext — lightweight global toast notifications.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast({ type: 'success', message: 'Saved!' });
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { CheckCircle2, Info, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (t: { type?: ToastType; message: string }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastType, string> = {
  success: 'bg-sage text-white',
  error: 'bg-primary text-white',
  info: 'bg-charcoal text-white',
  warning: 'bg-amber-500 text-white',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'info', message }: { type?: ToastType; message: string }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      // Auto-dismiss after 4s.
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className={`toast-enter flex items-start gap-3 rounded-xl px-4 py-3 shadow-card ${COLORS[t.type]}`}
            >
              <Icon size={20} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 opacity-80 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// Re-export hook so Socket-driven toasts can be fired from anywhere.
export function useToastSafe() {
  const ctx = useContext(ToastContext);
  return ctx;
}
