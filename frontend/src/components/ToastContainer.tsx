import React from 'react';
import { useApp } from '../store/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Bell, MessageSquare } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md w-[calc(100vw-2rem)] sm:w-96 space-y-2.5 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-2 ${isSuccess
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
              : isError
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-100'
                : isWarning
                  ? 'bg-amber-950/90 border-amber-500/30 text-amber-100'
                  : 'bg-slate-900/95 border-cyan-500/30 text-slate-100'
              }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isInfo && (
                toast.message.includes('💬') ? (
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Bell className="w-5 h-5 text-cyan-400" />
                )
              )}
            </div>

            <div className="flex-1 text-[13px] leading-snug font-medium break-words">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
