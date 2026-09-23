import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(4);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto remove after 4.5s
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast, unreadCount, setUnreadCount }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto p-4 rounded-xl shadow-luxury flex items-start gap-3 border ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
                    : isError
                    ? 'bg-rose-50 text-rose-950 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
                    : isWarning
                    ? 'bg-amber-50 text-amber-950 border-amber-200 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
                    : 'bg-blue-50 text-blue-950 border-blue-200 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                </div>
                <div className="flex-1 text-sm">
                  {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
                  <div className="opacity-90">{toast.message}</div>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
