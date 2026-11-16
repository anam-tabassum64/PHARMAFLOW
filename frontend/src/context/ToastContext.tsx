import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message, 6000), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message, 5000), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Toast Notification Floating Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const config = {
            success: {
              icon: CheckCircle2,
              iconColor: 'text-[#183D32]',
              border: 'border-l-4 border-l-[#183D32]',
            },
            error: {
              icon: AlertCircle,
              iconColor: 'text-[#C93B2B]',
              border: 'border-l-4 border-l-[#C93B2B]',
            },
            warning: {
              icon: AlertTriangle,
              iconColor: 'text-[#C27803]',
              border: 'border-l-4 border-l-[#C27803]',
            },
            info: {
              icon: Info,
              iconColor: 'text-[#183D32]',
              border: 'border-l-4 border-l-[#183D32]',
            },
          }[toast.type];

          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-white rounded-xl border border-[#E6E5DD] shadow-modal p-4 flex items-start gap-3 transition-all ${config.border}`}
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-heading font-extrabold text-[#252A27]">{toast.title}</h4>
                {toast.message && (
                  <p className="text-[11px] text-[#777C76] mt-0.5 leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#777C76] hover:text-[#252A27] transition-colors p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
