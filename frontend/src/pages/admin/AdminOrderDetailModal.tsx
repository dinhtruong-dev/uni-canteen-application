import React, { useState } from 'react';
import {
  X,
  Receipt,
  User,
  Phone,
  Store,
  MapPin,
  Clock,
  QrCode,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useApp } from '../../store/AppContext';

interface AdminOrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

export const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const { updateOrderStatus, cancelOrder, showToast } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order?.status || 'PENDING');
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelConfirm, setIsCancelConfirm] = useState(false);

  if (!isOpen || !order) return null;

  const handleApplyStatus = () => {
    if (onStatusChange) {
      onStatusChange(order.id, selectedStatus);
    } else {
      updateOrderStatus(order.id, selectedStatus);
    }
    showToast(`Đã can thiệp cập nhật trạng thái đơn ${order.orderNumber} thành ${selectedStatus}!`, 'info');
  };

  const handleAdminCancel = () => {
    if (!cancelReason.trim()) {
      showToast('Vui lòng nhập lý do can thiệp hủy đơn!', 'error');
      return;
    }
    cancelOrder(order.id, `Admin can thiệp: ${cancelReason}`);
    showToast(`Đã hủy đơn ${order.orderNumber} theo quyết định quản trị!`, 'warning');
    setIsCancelConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-slate-100 text-base">
                  {order.orderNumber}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-purple-300 border border-slate-700">
                  {order.orderType === 'DINE_IN'
                    ? 'ĂN TẠI BÀN'
                    : order.orderType === 'PICKUP'
                    ? 'NHẬN TẠI QUẦY'
                    : 'GIAO TẬN PHÒNG'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Đặt lúc: {order.createdAt}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Customer & Canteen Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Thông tin khách hàng
              </span>
              <p className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                {order.userName}
              </p>
              <p className="text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order.userPhone || '0987 654 321'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Căn tin tiếp nhận
              </span>
              <p className="font-extrabold text-slate-100 text-sm flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                {order.canteenName}
              </p>
              <p className="text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {order.tableInfo
                  ? `Bàn ăn: ${order.tableInfo.tableName}`
                  : order.pickupTimeSlot
                  ? `Khung giờ nhận: ${order.pickupTimeSlot}`
                  : order.deliveryAddress
                  ? `Phòng: ${order.deliveryAddress.building} - ${order.deliveryAddress.room}`
                  : 'Tại quầy'}
              </p>
            </div>
          </div>

          {/* Ordered Food Items */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Danh sách món ăn ({order.items.length} món)
            </span>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.food.image}
                      alt={item.food.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                    />
                    <div>
                      <p className="font-bold text-slate-100">
                        {item.food.name} <span className="text-amber-400 font-mono">x{item.quantity}</span>
                      </p>
                      {item.selectedSize && (
                        <span className="text-[10px] text-slate-400">Size: {item.selectedSize.name} • </span>
                      )}
                      {item.selectedToppings && item.selectedToppings.length > 0 && (
                        <span className="text-[10px] text-slate-400">
                          Toppings: {item.selectedToppings.map((t) => t.name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-200">
                      {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing & Payment Details */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Tiền món (Tạm tính):</span>
              <span className="font-mono text-slate-200">{order.subtotal.toLocaleString('vi-VN')}đ</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Phí giao tận phòng KTX:</span>
                <span className="font-mono text-slate-200">+{order.shippingFee.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Khuyến mãi voucher:</span>
                <span className="font-mono">-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black">
              <span className="text-slate-100">Tổng thanh toán:</span>
              <span className="font-mono text-emerald-400 text-base">
                {order.totalAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Phương thức:</span>
              <span className="font-bold text-purple-300">{order.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Trạng thái thanh toán:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {order.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
              </span>
            </div>
          </div>

          {/* Admin Override Section */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-extrabold uppercase text-[11px]">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Quyền can thiệp quản trị hệ thống</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="block text-[11px] text-slate-400 mb-1">Cập nhật trạng thái đơn khẩn cấp</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 outline-hidden"
                >
                  <option value="PENDING">PENDING (Chờ nhân viên duyệt)</option>
                  <option value="CONFIRMED">CONFIRMED (Đã duyệt - Chuyển POS bếp)</option>
                  <option value="PREPARING">PREPARING (Bếp đang nấu)</option>
                  <option value="READY">READY (Nấu xong - Đẩy về nhân viên)</option>
                  <option value="DELIVERING">DELIVERING (Đang giao tận phòng)</option>
                  <option value="COMPLETED">COMPLETED (Hoàn tất giao nhận)</option>
                  <option value="CANCELLED">CANCELLED (Hủy đơn hàng)</option>
                </select>
              </div>

              <div className="flex items-end pt-5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleApplyStatus}
                  className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Cập Nhật
                </button>
              </div>
            </div>

            {/* Emergency Cancel Action */}
            <div className="pt-2 border-t border-purple-800/40">
              {!isCancelConfirm ? (
                <button
                  type="button"
                  onClick={() => setIsCancelConfirm(true)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
                >
                  Hủy đơn khẩn cấp và hoàn tiền ví nếu có
                </button>
              ) : (
                <div className="space-y-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50">
                  <label className="block text-rose-300 text-[11px] font-bold">
                    Lý do hủy đơn bắt buộc:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Căn tin gặp sự cố mất điện / Khách báo nhầm..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-rose-700 rounded-xl text-slate-100 text-xs outline-hidden"
                  />
                  <div className="flex items-center gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCancelConfirm(false)}
                      className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Bỏ qua
                    </button>
                    <button
                      type="button"
                      onClick={handleAdminCancel}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Xác nhận hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
