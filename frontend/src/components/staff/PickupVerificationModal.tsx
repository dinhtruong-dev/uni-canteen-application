import React, { useState } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Search,
  Receipt,
  User,
  Phone,
  Utensils,
  Clock,
  Sparkles,
  Camera,
} from 'lucide-react';
import { staffService } from '../../services/api';

interface PickupVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  canteenId?: string;
  onSuccess?: (order: any) => void;
}

export const PickupVerificationModal: React.FC<PickupVerificationModalProps> = ({
  isOpen,
  onClose,
  canteenId = 'cant-a',
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError('Vui lòng nhập mã nhận món');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessOrder(null);

    try {
      const res = await staffService.verifyPickup(code.trim(), canteenId);
      if (res.success && res.data) {
        setSuccessOrder(res.data);
        if (onSuccess) onSuccess(res.data);
      } else {
        setError(res.message || 'Mã nhận món không hợp lệ');
      }
    } catch (err: any) {
      setError(err?.message || 'Không tìm thấy đơn hàng tương ứng với mã này');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setError(null);
    setSuccessOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">Xác nhận Khách Nhận Món (PICKUP)</h2>
              <p className="text-xs text-slate-400">Quét mã QR hoặc nhập mã nhận của sinh viên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!successOrder ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Mã nhận món hoặc Mã đơn hàng:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError(null);
                    }}
                    placeholder="Ví dụ: PK-8291 hoặc ORD-8291..."
                    autoFocus
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3.5 pl-11 text-base font-mono font-bold tracking-wider text-emerald-300 placeholder:text-slate-500 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all uppercase"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  {code && (
                    <button
                      type="button"
                      onClick={() => setCode('')}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick sample chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">Gợi ý test nhanh:</span>
                {['ORD-8291', 'ORD-8292', 'ORD-8295'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setCode(sample);
                      setError(null);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400 border border-slate-700 transition-colors"
                  >
                    #{sample}
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs animate-in shake duration-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận giao món cho khách</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success Card */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-base text-emerald-300">Giao món thành công!</div>
                  <div className="text-xs text-emerald-400/80">
                    Đơn hàng #{successOrder.orderCode} đã hoàn tất và lưu vào hệ thống.
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{successOrder.userName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{successOrder.userPhone}</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {successOrder.orderDetails?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400">{item.quantity}x</span>
                        <span className="text-slate-200">{item.productName}</span>
                      </div>
                      <span className="text-slate-400 font-mono">
                        {item.itemSubtotal?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-2 flex items-center justify-between font-bold text-sm">
                  <span className="text-slate-300">Tổng thanh toán:</span>
                  <span className="text-emerald-400 font-mono">
                    {successOrder.finalAmount?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Xác nhận đơn tiếp theo
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
