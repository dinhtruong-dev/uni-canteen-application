import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const colorMap = {
        danger: {
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            icon: 'text-rose-600',
            button: 'bg-rose-600 hover:bg-rose-700',
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon: 'text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700',
        },
    };

    const colors = colorMap[variant];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100"
                >
                    <div className="p-5 flex items-start gap-4">
                        <div
                            className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}
                        >
                            <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-slate-900 text-base">{title}</h3>
                            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line">
                                {message}
                            </p>
                        </div>

                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="text-slate-400 hover:text-slate-700 transition-colors shrink-0 disabled:opacity-50"
                            aria-label="Đóng"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-5 pb-5 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2.5 rounded-xl ${colors.button} text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? 'Đang xử lý...' : confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};