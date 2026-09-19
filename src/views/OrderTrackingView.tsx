import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import {
  Clock,
  MapPin,
  Phone,
  QrCode,
  ArrowLeft,
  ShoppingBag,
  Star,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { viewParams, orders, navigateTo, showToast } = useApp();
  const orderId = viewParams?.orderId;

  const order = orders.find((o) => o.id === orderId) || orders[0];

  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">Không tìm thấy thông tin đơn hàng</p>
        <button
          onClick={() => navigateTo('orders')}
          className="mt-3 text-orange-600 font-bold text-xs underline"
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    showToast('Cảm ơn bạn đã gửi đánh giá cho căng tin! ⭐⭐⭐⭐⭐', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateTo('orders')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Theo Dõi Đơn Hàng {order.orderNumber}
          </h1>
          <p className="text-xs text-slate-500">Cập nhật tiến độ realtime từ nhà bếp căng tin</p>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Trạng thái hiện tại:</span>
            <span className="font-extrabold text-orange-600 text-base">
              {order.status === 'PENDING'
                ? 'Đã đặt hàng - Chờ xác nhận'
                : order.status === 'CONFIRMED'
                ? 'Căng tin đã xác nhận'
                : order.status === 'PREPARING'
                ? 'Nhà bếp đang chế biến'
                : order.status === 'READY'
                ? 'Sẵn sàng - Mời nhận món'
                : order.status === 'DELIVERING'
                ? 'Shipper đang giao tận phòng'
                : order.status === 'SERVED'
                ? 'Đã mang ra bàn ăn'
                : order.status === 'COMPLETED'
                ? 'Đơn hàng đã hoàn thành 🎉'
                : 'Đơn hàng đã bị hủy'}
            </span>
          </div>

          <span className="bg-orange-100 text-orange-800 font-extrabold text-xs px-3 py-1 rounded-full">
            {order.orderType === 'DINE_IN'
              ? '🍽️ Ăn tại chỗ'
              : order.orderType === 'PICKUP'
              ? '🏃 Nhận tại quầy'
              : '🏠 Giao tận phòng'}
          </span>
        </div>

        {/* Visual Timeline */}
        <OrderStatusTimeline order={order} />

        {/* Estimated Time Callout */}
        {order.estimatedTime && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-900 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Thời gian hoàn thành dự kiến:</span>
            </div>
            <span className="font-extrabold text-sm">{order.estimatedTime}</span>
          </div>
        )}
      </div>

      {/* QR Code & Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Items List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-orange-600" /> Danh Sách Món Ăn
          </h3>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">
                    {item.quantity}x {item.food.name}
                  </p>
                  {item.selectedSize && (
                    <p className="text-[10px] text-slate-400">Size: {item.selectedSize.name}</p>
                  )}
                  {item.selectedToppings && item.selectedToppings.length > 0 && (
                    <p className="text-[10px] text-slate-500">
                      Topping: {item.selectedToppings.map((t) => t.name).join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-bold text-slate-900">
                  {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between font-extrabold text-sm text-slate-900">
            <span>Tổng tiền:</span>
            <span className="text-orange-600">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* QR Code Display & Canteen Info */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <QrCode className="w-4 h-4" /> Mã Nhận Đơn
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{order.orderNumber}</span>
            </div>

            <div className="w-32 h-32 bg-white rounded-2xl p-2 mx-auto flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${order.qrCodeValue}`}
                alt="Order QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Xuất trình mã QR tại quầy căng tin để nhận món ăn
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white">{order.canteenName}</p>
            <p className="flex items-center gap-1 text-[11px] text-slate-400">
              <Phone className="w-3.5 h-3.5" /> Gọi Căng tin: 0988 123 456
            </p>
          </div>
        </div>
      </div>

      {/* Review Box when order is COMPLETED */}
      {order.status === 'COMPLETED' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            ⭐ Đánh Giá Chất Lượng Bữa Ăn
          </h3>

          {reviewSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-xs text-emerald-900 font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Cảm ơn bạn đã gửi phản hồi cho nhà bếp!
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Đánh giá số sao (1 - 5 sao):
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl transition-transform active:scale-90 ${
                        star <= rating ? 'text-amber-500' : 'text-slate-300'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Món ăn vừa vị không? Phục vụ thế nào? Nhập nhận xét của bạn..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Gửi Đánh Giá
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
