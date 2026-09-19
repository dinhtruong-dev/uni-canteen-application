import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const getIcon = () => {
            switch (toast.type) {
              case 'success':
                return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
              case 'error':
                return <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
              case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
              default:
                return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
            }
          };

          const getBg = () => {
            switch (toast.type) {
              case 'success':
                return 'bg-emerald-50 border-emerald-200 text-emerald-950';
              case 'error':
                return 'bg-red-50 border-red-200 text-red-950';
              case 'warning':
                return 'bg-amber-50 border-amber-200 text-amber-950';
              default:
                return 'bg-blue-50 border-blue-200 text-blue-950';
            }
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${getBg()}`}
            >
              {getIcon()}
              <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
