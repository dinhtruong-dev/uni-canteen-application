import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { HeaderNav } from '../../components/HeaderNav';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  QrCode,
  Clock,
  MapPin,
  ShoppingBag,
  Home,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const OrderSuccessView: React.FC<{ orderId?: string }> = ({ orderId: propOrderId }) => {
  const { viewParams, orders, navigateTo } = useApp();
  const orderId = propOrderId || viewParams?.orderId;

  const currentOrder = orders.find((o) => o.id === orderId) || orders[0];

  useEffect(() => {
    // Fire confetti on load!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore if unavailable
    }
  }, []);

  if (!currentOrder) {
    navigateTo('home');
    return null;
  }

  return (
    <div className="max-w-xl mx-auto py-4 px-4 space-y-6">
      {/* Header Navigation Component */}
      <HeaderNav
        title="Đặt Đơn Thành Công"
        onBack={() => navigateTo('home')}
      />
      {/* Success Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl text-center space-y-5 relative overflow-hidden">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1 text-xs font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" /> DANG XỬ LÝ TẠI CĂNG TIN
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Đặt Món Thành Công! 🎉
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đơn hàng của bạn đã được gửi xuống nhà bếp căng tin.
          </p>
        </div>

        {/* Order Details Box */}
        <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Mã đơn hàng:</span>
            <span className="font-extrabold text-slate-900 text-sm font-mono">
              {currentOrder.orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Hình thức nhận món:</span>
            <span className="font-bold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-md">
              {currentOrder.orderType === 'DINE_IN'
                ? '🍽️ Ăn tại căng tin'
                : currentOrder.orderType === 'PICKUP'
                ? '🏃 Nhận tại quầy'
                : '🏠 Giao tận phòng'}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
            <span className="text-slate-500">Tổng thanh toán:</span>
            <span className="font-black text-slate-900 text-sm">
              {currentOrder.totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Location info */}
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">{currentOrder.canteenName}</span>
              {currentOrder.orderType === 'DINE_IN' && currentOrder.tableInfo && (
                <span className="text-orange-600 font-semibold">
                  Bàn: {currentOrder.tableInfo.tableName}
                </span>
              )}
              {currentOrder.orderType === 'DELIVERY' && currentOrder.deliveryAddress && (
                <span className="text-slate-600">
                  {currentOrder.deliveryAddress.building} - {currentOrder.deliveryAddress.room}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Order QR Code Card */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col items-center justify-center space-y-2">
          <div className="w-36 h-36 bg-white rounded-xl p-2 flex items-center justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentOrder.qrCodeValue}`}
              alt="Order QR Code"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-[11px] text-slate-300 font-mono">
            Mã QR Đơn: {currentOrder.orderNumber}
          </p>
          <p className="text-[10px] text-slate-400">
            Xuất trình mã QR này tại quầy căng tin khi nhận món ăn
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => navigateTo('order-detail', { orderId: currentOrder.id })}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Clock className="w-4 h-4" /> Theo Dõi Trạng Thái Đơn Hàng (Realtime)
          </button>

          <button
            onClick={() => navigateTo('home')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
};
