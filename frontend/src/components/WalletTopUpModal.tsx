import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { X, Wallet, QrCode, CreditCard, Sparkles, Check, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WalletTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletTopUpModal: React.FC<WalletTopUpModalProps> = ({ isOpen, onClose }) => {
  const { walletBalance, topUpWallet, showToast } = useApp();
  const [selectedAmount, setSelectedAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<'SELECT' | 'QR_PAYMENT' | 'SUCCESS'>('SELECT');
  const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'BANK'>('VNPAY');

  if (!isOpen) return null;

  const quickAmounts = [20000, 50000, 100000, 200000, 500000];

  const effectiveAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;

  const handleProceedToPayment = () => {
    if (effectiveAmount < 10000) {
      showToast('Số tiền nạp tối thiểu là 10.000đ', 'warning');
      return;
    }
    setPaymentStep('QR_PAYMENT');
  };

  const handleConfirmPaid = () => {
    topUpWallet(effectiveAmount, paymentMethod === 'VNPAY' ? 'VNPay QR' : 'Chuyển khoản Ngân hàng');
    setPaymentStep('SUCCESS');
    setTimeout(() => {
      setPaymentStep('SELECT');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative border border-slate-100"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-700 text-white p-5 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base">Ví Sinh Viên UniEat</span>
            </div>

            <div className="mt-3">
              <span className="text-xs text-emerald-100 font-medium">Số dư hiện tại:</span>
              <div className="text-2xl font-black">{walletBalance.toLocaleString('vi-VN')}đ</div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {paymentStep === 'SELECT' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Chọn số tiền muốn nạp:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${selectedAmount === amt && !customAmount
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        {amt.toLocaleString('vi-VN')}đ
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Hoặc nhập số tiền khác:
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Nhập số tiền (VD: 150000)..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Hình thức thanh toán:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('VNPAY')}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${paymentMethod === 'VNPAY'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 text-slate-700'
                        }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-600" /> VNPay QR
                    </button>
                    <button
                      onClick={() => setPaymentMethod('BANK')}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${paymentMethod === 'BANK'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 text-slate-700'
                        }`}
                    >
                      <CreditCard className="w-4 h-4 text-teal-600" /> Chuyển khoản
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span>Tiếp tục nạp {effectiveAmount.toLocaleString('vi-VN')}đ</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            )}

            {paymentStep === 'QR_PAYMENT' && (
              <div className="text-center space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 inline-block mx-auto">
                  <div className="w-48 h-48 bg-white border border-slate-200 rounded-xl p-2 mx-auto flex flex-col items-center justify-center">
                    {/* Simulated VNPay QR Code */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=UNIEAT-TOPUP-${effectiveAmount}`}
                      alt="VNPay QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs font-extrabold text-emerald-900 mt-2">
                    Quét mã QR để thanh toán {effectiveAmount.toLocaleString('vi-VN')}đ
                  </p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Mở ứng dụng Ngân hàng hoặc Ví VNPay, chọn Quét QR để nạp tiền vào ví.
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setPaymentStep('SELECT')}
                    className="w-1/3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleConfirmPaid}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Tôi đã chuyển tiền
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 'SUCCESS' && (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Nạp tiền thành công!</h3>
                <p className="text-xs text-slate-600">
                  Đã cộng <strong className="text-emerald-600">+{effectiveAmount.toLocaleString('vi-VN')}đ</strong> vào Ví Sinh Viên của bạn.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
