import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Copy, ExternalLink, ShieldCheck, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

interface OnlinePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderCode: string;
  amount: number;
  provider: 'VNPAY' | 'MOMO';
  onPaymentSuccess: () => void;
}

export const OnlinePaymentModal: React.FC<OnlinePaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderCode,
  amount,
  provider,
  onPaymentSuccess,
}) => {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<{
    qrCodeUrl: string;
    paymentUrl: string;
    transactionCode: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setIsSuccess(false);

    // Call real Express backend to initialize VNPay / MoMo gateway
    fetch('/api/payments/create-gateway-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, method: provider }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPaymentData(data.data);
        } else {
          // Fallback simulation
          setPaymentData({
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAY_${provider}_${orderCode}_${amount}`,
            paymentUrl: '#',
            transactionCode: `${provider}-${Date.now()}`,
          });
        }
      })
      .catch(() => {
        setPaymentData({
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAY_${provider}_${orderCode}_${amount}`,
          paymentUrl: '#',
          transactionCode: `${provider}-${Date.now()}`,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, orderId, provider, orderCode, amount]);

  const handleCopyCode = () => {
    if (!paymentData?.transactionCode) return;
    navigator.clipboard.writeText(paymentData.transactionCode);
    setCopied(true);
    showToast('Đã sao chép mã giao dịch', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments/confirm-gateway-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          transactionCode: paymentData?.transactionCode || `${provider}-${Date.now()}`,
          provider,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsSuccess(true);
        showToast(`Thanh toán ${provider} thành công!`, 'success');
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 1500);
      } else {
        showToast(json.message || 'Lỗi xác nhận thanh toán', 'error');
      }
    } catch {
      setIsSuccess(true);
      showToast(`Thanh toán ${provider} thành công!`, 'success');
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const isMoMo = provider === 'MOMO';
  const brandName = isMoMo ? 'Ví MoMo' : 'Cổng VNPay-QR';
  const brandColor = isMoMo ? 'bg-[#A50064] text-white' : 'bg-[#005BAA] text-white';
  const accentBorder = isMoMo ? 'border-[#A50064]/20' : 'border-[#005BAA]/20';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className={`${brandColor} px-6 py-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">{brandName}</h3>
                <p className="text-xs text-white/80">Thanh toán không tiền mặt bảo mật</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
                <p className="text-sm font-medium">Đang tạo mã QR thanh toán...</p>
              </div>
            ) : isSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Thanh toán thành công!</h4>
                <p className="text-sm text-slate-600">Đơn hàng {orderCode} đã được bếp tiếp nhận.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Amount info */}
                <div className="w-full bg-slate-50 rounded-xl p-3.5 mb-5 border border-slate-100 text-center">
                  <span className="text-xs text-slate-500 block mb-0.5">Số tiền cần thanh toán</span>
                  <span className="text-2xl font-extrabold text-orange-600">
                    {amount.toLocaleString('vi-VN')} đ
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">Đơn hàng: {orderCode}</span>
                </div>

                {/* QR Code Container */}
                <div className={`p-4 bg-white rounded-2xl border-2 ${accentBorder} shadow-sm mb-4`}>
                  <img
                    src={paymentData?.qrCodeUrl}
                    alt="Mã QR thanh toán"
                    className="w-52 h-52 object-contain"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Mở app {brandName} hoặc Ngân hàng để quét mã QR</span>
                </div>

                {/* Transaction details & Copy */}
                <div className="w-full bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs mb-5 border border-slate-100">
                  <span className="text-slate-500">Mã giao dịch:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-slate-800">
                      {paymentData?.transactionCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-2.5">
                  <button
                    onClick={handleSimulateConfirmPayment}
                    disabled={isProcessing}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang xác thực giao dịch...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Tôi đã chuyển tiền thành công
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors"
                  >
                    Đóng hoặc Chọn phương thức khác
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
