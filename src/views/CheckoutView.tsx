import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, OrderType } from '../types';
import { MOCK_TIME_SLOTS, MOCK_CAMPUS_LOCATIONS } from '../data/mockData';
import { OnlinePaymentModal } from '../components/OnlinePaymentModal';
import {
  Wallet,
  CreditCard,
  Banknote,
  CheckCircle2,
  QrCode,
  MapPin,
  Clock,
  Home as HomeIcon,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Building2,
  Phone,
  FileText,
  Tag,
  X,
  Smartphone,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    orderType,
    setOrderType,
    canteens,
    selectedCanteen,
    setSelectedCanteen,
    tableInfo,
    pickupTimeSlot,
    setPickupTimeSlot,
    deliveryAddress,
    setDeliveryAddress,
    walletBalance,
    totalAmount,
    subtotal,
    shippingFee,
    discountAmount,
    appliedPromotion,
    applyPromotion,
    removePromotion,
    createOrder,
    navigateTo,
    setQrScannerOpen,
    currentUser,
    showToast,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('STUDENT_WALLET');
  const [orderNotes, setOrderNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;
    const res = applyPromotion(couponCode);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  // Delivery Form Local State
  const [delCampus, setDelCampus] = useState('Cơ sở 1 (Khu Trung Tâm Main Campus)');
  const [delArea, setDelArea] = useState('Khu Ký Túc Xá A');
  const [delBuilding, setDelBuilding] = useState('Tòa A1 (KTX Nam)');
  const [delFloor, setDelFloor] = useState('Tầng 3');
  const [delRoom, setDelRoom] = useState(deliveryAddress?.room || 'Phòng 305');
  const [delPhone, setDelPhone] = useState(deliveryAddress?.phone || currentUser.phone || '0912 345 678');
  const [delNotes, setDelNotes] = useState(deliveryAddress?.notes || 'Gọi trước khi lên phòng');

  // State for Online Payment Modal (VNPay & MoMo)
  const [onlineModalOpen, setOnlineModalOpen] = useState(false);
  const [pendingGatewayOrder, setPendingGatewayOrder] = useState<{
    id: string;
    orderCode: string;
    amount: number;
    provider: 'VNPAY' | 'MOMO';
  } | null>(null);

  if (cart.length === 0) {
    navigateTo('cart');
    return null;
  }

  const handleConfirmOrder = () => {
    // If delivery mode, update address object first
    if (orderType === 'DELIVERY') {
      const fullAddr = {
        campus: delCampus,
        area: delArea,
        building: delBuilding,
        floor: delFloor,
        room: delRoom,
        phone: delPhone,
        notes: delNotes,
      };
      setDeliveryAddress(fullAddr);
    }

    const created = createOrder(paymentMethod, orderNotes);
    if (!created) return;

    if (paymentMethod === 'VNPAY_QR') {
      setPendingGatewayOrder({
        id: created.id,
        orderCode: created.orderCode || created.id,
        amount: created.finalAmount,
        provider: 'VNPAY',
      });
      setOnlineModalOpen(true);
    } else if (paymentMethod === 'MOMO') {
      setPendingGatewayOrder({
        id: created.id,
        orderCode: created.orderCode || created.id,
        amount: created.finalAmount,
        provider: 'MOMO',
      });
      setOnlineModalOpen(true);
    } else {
      navigateTo('order-success', { orderId: created.id });
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Thanh Toán & Đặt Món</h1>
        <p className="text-xs text-slate-500 mt-0.5">Xác nhận thông tin nhận hàng và hình thức thanh toán</p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs grid grid-cols-3 gap-1">
        <button
          onClick={() => {
            setOrderType('DINE_IN');
            if (!tableInfo) setQrScannerOpen(true);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            orderType === 'DINE_IN'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🍽️ Ăn tại căng tin
        </button>
        <button
          onClick={() => setOrderType('PICKUP')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            orderType === 'PICKUP'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏃 Nhận tại quầy
        </button>
        <button
          onClick={() => setOrderType('DELIVERY')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            orderType === 'DELIVERY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏠 Giao tận phòng
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Mode Details Configuration */}
        <div className="md:col-span-2 space-y-6">
          {/* Canteen Picker */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" /> Chọn Căng Tin Phục Vụ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {canteens.map((cant) => {
                const isSelected = selectedCanteen?.id === cant.id;
                return (
                  <button
                    key={cant.id}
                    onClick={() => setSelectedCanteen(cant)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 font-bold text-orange-950 ring-2 ring-orange-500/20'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs block line-clamp-1">{cant.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{cant.location}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DINE_IN Details Form */}
          {orderType === 'DINE_IN' && (
            <div className="bg-orange-50/50 border-2 border-orange-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  🍽️ Thông tin Bàn Ăn tại Căng Tin
                </h3>
                <button
                  onClick={() => setQrScannerOpen(true)}
                  className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5" /> Quét mã bàn khác
                </button>
              </div>

              {tableInfo ? (
                <div className="bg-white p-4 rounded-2xl border border-orange-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Đã quét QR nhận diện bàn:</span>
                    <span className="font-extrabold text-slate-900 text-base">{tableInfo.tableName}</span>
                    <span className="text-xs text-orange-600 block">{tableInfo.canteenName}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl border border-dashed border-orange-300 text-center space-y-2">
                  <p className="text-xs text-slate-600 font-medium">
                    Chưa nhận diện mã bàn! Vui lòng quét mã QR dán trên bàn ăn.
                  </p>
                  <button
                    onClick={() => setQrScannerOpen(true)}
                    className="bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Mở Trình Quét QR Bàn
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PICKUP Details Form */}
          {orderType === 'PICKUP' && (
            <div className="bg-blue-50/50 border-2 border-blue-200 rounded-3xl p-5 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                🏃 Chọn Khung Giờ Đến Căng Tin Nhận Món
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MOCK_TIME_SLOTS.map((slot) => {
                  const isSelected = pickupTimeSlot === slot.timeRange;
                  const isFull = !slot.isAvailable;
                  return (
                    <button
                      key={slot.id}
                      disabled={isFull}
                      onClick={() => setPickupTimeSlot(slot.timeRange)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isFull
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : isSelected
                          ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">{slot.timeRange}</span>
                      <span className="text-[10px] block mt-0.5 opacity-80">
                        {isFull ? 'Khung giờ đầy' : `Đã đặt ${slot.bookedCount}/${slot.capacity}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DELIVERY Details Form */}
          {orderType === 'DELIVERY' && (
            <div className="bg-emerald-50/50 border-2 border-emerald-200 rounded-3xl p-5 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                🏠 Địa Chỉ Giao Hàng Trong Khuôn Viên Trường
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cơ sở:</label>
                  <select
                    value={delCampus}
                    onChange={(e) => setDelCampus(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  >
                    <option value="Cơ sở 1 (Khu Trung Tâm Main Campus)">Cơ sở 1 (Main Campus)</option>
                    <option value="Cơ sở 2 (Khu Công Nghệ B4)">Cơ sở 2 (Khoa CNTT B4)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khu vực:</label>
                  <select
                    value={delArea}
                    onChange={(e) => setDelArea(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  >
                    <option value="Khu Ký Túc Xá A">Khu Ký Túc Xá A</option>
                    <option value="Khu Ký Túc Xá B">Khu Ký Túc Xá B</option>
                    <option value="Khu Giảng Đường Tự Học">Khu Giảng Đường</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tòa nhà:</label>
                  <input
                    type="text"
                    value={delBuilding}
                    onChange={(e) => setDelBuilding(e.target.value)}
                    placeholder="VD: Tòa A1 KTX"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tầng & Số Phòng:</label>
                  <input
                    type="text"
                    value={delRoom}
                    onChange={(e) => setDelRoom(e.target.value)}
                    placeholder="VD: Tầng 3 - Phòng 305"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại sinh viên:</label>
                  <input
                    type="text"
                    value={delPhone}
                    onChange={(e) => setDelPhone(e.target.value)}
                    placeholder="Nhập SĐT nhận hàng..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ghi chú người giao:</label>
                  <input
                    type="text"
                    value={delNotes}
                    onChange={(e) => setDelNotes(e.target.value)}
                    placeholder="Giao lên phòng 305, gọi điện trước..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-600" /> Phương Thức Thanh Toán
            </h3>

            <div className="space-y-2">
              {/* Wallet Option */}
              <label
                onClick={() => setPaymentMethod('STUDENT_WALLET')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'STUDENT_WALLET'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">Ví Sinh Viên UniEat</span>
                    <span className="text-[11px] text-slate-500 block">
                      Số dư hiện tại: {walletBalance.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
                {paymentMethod === 'STUDENT_WALLET' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
              </label>

              {/* VNPay QR */}
              <label
                onClick={() => setPaymentMethod('VNPAY_QR')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'VNPAY_QR'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-950 font-bold ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">Thanh toán VNPay QR / Ngân hàng</span>
                    <span className="text-[11px] text-slate-500 block">Quét mã VietQR / VNPAY nhận món ngay</span>
                  </div>
                </div>
                {paymentMethod === 'VNPAY_QR' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </label>

              {/* MoMo QR */}
              <label
                onClick={() => setPaymentMethod('MOMO')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'MOMO'
                    ? 'border-[#A50064] bg-pink-50/50 text-[#A50064] font-bold ring-2 ring-[#A50064]/20'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#A50064] flex items-center justify-center font-bold text-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">Ví điện tử MoMo</span>
                    <span className="text-[11px] text-slate-500 block">Thanh toán quét mã MoMo QR siêu tốc</span>
                  </div>
                </div>
                {paymentMethod === 'MOMO' && <CheckCircle2 className="w-5 h-5 text-[#A50064]" />}
              </label>

              {/* Cash */}
              <label
                onClick={() => setPaymentMethod('CASH')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-slate-800 bg-slate-50 text-slate-950 font-bold ring-2 ring-slate-400/20'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">Tiền mặt</span>
                    <span className="text-[11px] text-slate-500 block">Thanh toán khi nhận món tại quầy/phòng</span>
                  </div>
                </div>
                {paymentMethod === 'CASH' && <CheckCircle2 className="w-5 h-5 text-slate-800" />}
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Submit */}
        <div className="space-y-4">
          {/* Coupon Code Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-orange-600" />
              Mã giảm giá / Khuyến mãi
            </label>

            {appliedPromotion ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-900 block">{appliedPromotion.code}</span>
                  <span className="text-emerald-700 text-[11px]">{appliedPromotion.title}</span>
                </div>
                <button
                  onClick={removePromotion}
                  className="p-1 text-emerald-700 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã (CAMPUS50)..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}
              </form>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Tóm Tắt Đơn Hàng ({cart.length} món)
            </h3>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1 text-xs">
              {cart.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                      {item.quantity}x {item.food.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {item.selectedSize?.name}
                    </p>
                  </div>
                  <span className="font-extrabold text-slate-900 shrink-0">
                    {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-bold">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng:</span>
                <span className="font-bold">{shippingFee.toLocaleString('vi-VN')}đ</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Giảm giá:</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-orange-600 pt-2 border-t border-slate-100">
                <span>Tổng tiền:</span>
                <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <button
              onClick={handleConfirmOrder}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md shadow-orange-500/20 text-sm flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>Xác Nhận Đặt Hàng</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* Online Payment Modal (VNPay & MoMo QR Gateway) */}
      {pendingGatewayOrder && (
        <OnlinePaymentModal
          isOpen={onlineModalOpen}
          onClose={() => setOnlineModalOpen(false)}
          orderId={pendingGatewayOrder.id}
          orderCode={pendingGatewayOrder.orderCode}
          amount={pendingGatewayOrder.amount}
          provider={pendingGatewayOrder.provider}
          onPaymentSuccess={() => {
            navigateTo('order-success', { orderId: pendingGatewayOrder.id });
          }}
        />
      )}
    </div>
  );
};
