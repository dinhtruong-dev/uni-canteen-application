import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Utensils,
  MapPin,
  Calendar,
  AlertTriangle,
  Receipt,
  QrCode,
  DollarSign,
  ChevronRight,
  Truck,
  PackageCheck,
  ChefHat,
  Ban,
  MessageSquare,
  Flame,
  Megaphone,
  Check,
  Sparkles,
} from 'lucide-react';
import { staffOrderService, kdsService } from '../../services/api/client';
import { orderService } from '../../services/api/client';
import { OrderChatModal } from '../../components/staff/OrderChatModal';

interface StaffOrderDetailModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const StaffOrderDetailModal: React.FC<StaffOrderDetailModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Hết nguyên liệu chế biến');
  const [customReason, setCustomReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallingCustomer, setIsCallingCustomer] = useState(false);

  const handleCallCustomer = async () => {
    try {
      setIsCallingCustomer(true);
      await kdsService.callCustomer(orderId);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsCallingCustomer(false), 2500);
    }
  };

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderById(orderId);
      if (res) {
        setOrder(res);
      }
    } catch (err: any) {
      setErrorMsg('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (targetStatus: string) => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await staffOrderService.updateOrderStatus(orderId, targetStatus);
      if (res.success) {
        await fetchOrderDetail();
        if (onUpdated) onUpdated();
      } else {
        setErrorMsg(res.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi khi cập nhật trạng thái đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const finalReason = customReason.trim() ? customReason : cancelReason;
      const res = await staffOrderService.updateOrderStatus(orderId, 'CANCELLED', finalReason);
      if (res.success) {
        setShowCancelModal(false);
        await fetchOrderDetail();
        if (onUpdated) onUpdated();
      } else {
        setErrorMsg(res.message || 'Không thể hủy đơn hàng');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi khi hủy đơn hàng');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const status = order?.status;
  const orderType = order?.orderType;

  // Status Stepper Definitions
  const stepsByMethod: Record<string, { key: string; label: string; icon: any }[]> = {
    DINE_IN: [
      { key: 'PENDING', label: 'Chờ duyệt', icon: Clock },
      { key: 'CONFIRMED', label: 'Đã nhận', icon: CheckCircle2 },
      { key: 'PREPARING', label: 'Đang nấu', icon: ChefHat },
      { key: 'READY', label: 'Sẵn sàng', icon: PackageCheck },
      { key: 'SERVED', label: 'Đã ra bàn', icon: Utensils },
      { key: 'COMPLETED', label: 'Hoàn tất', icon: CheckCircle2 },
    ],
    TAKEAWAY: [
      { key: 'PENDING', label: 'Chờ duyệt', icon: Clock },
      { key: 'CONFIRMED', label: 'Đã nhận', icon: CheckCircle2 },
      { key: 'PREPARING', label: 'Đang nấu', icon: ChefHat },
      { key: 'READY', label: 'Sẵn sàng', icon: PackageCheck },
      { key: 'WAITING_PICKUP', label: 'Chờ lấy món', icon: QrCode },
      { key: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2 },
    ],
    DELIVERY: [
      { key: 'PENDING', label: 'Chờ duyệt', icon: Clock },
      { key: 'CONFIRMED', label: 'Đã nhận', icon: CheckCircle2 },
      { key: 'PREPARING', label: 'Đang nấu', icon: ChefHat },
      { key: 'READY', label: 'Sẵn sàng', icon: PackageCheck },
      { key: 'DELIVERING', label: 'Đang giao KTX', icon: Truck },
      { key: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2 },
    ],
  };

  const currentSteps = stepsByMethod[orderType] || stepsByMethod.DINE_IN;
  const currentStepIndex = currentSteps.findIndex((s) => s.key === status);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold">
              #{order?.orderCode?.slice(-4) || 'ORD'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-slate-100 font-mono">
                  Đơn hàng #{order?.orderCode}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300">
                  {order?.canteenName || 'Căng tin A2'}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {order?.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="In phiếu chế biến / Phiếu thu"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Stepper Timeline */}
          {status !== 'CANCELLED' ? (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Tiến trình xử lý đơn hàng
              </div>
              <div className="flex items-center justify-between relative">
                {currentSteps.map((st, idx) => {
                  const StepIcon = st.icon;
                  const isDone = currentStepIndex > idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={st.key} className="flex-1 flex flex-col items-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : isCurrent
                            ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 font-medium text-center ${isCurrent
                          ? 'text-amber-400 font-bold'
                          : isDone
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                          }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300">
              <Ban className="w-6 h-6 text-rose-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-sm">Đơn hàng này đã bị hủy</div>
                <div className="text-xs text-rose-400/80">
                  {order?.notes?.includes('Lý do hủy')
                    ? order.notes
                    : 'Đã hủy bởi quầy hoặc sinh viên.'}
                </div>
              </div>
            </div>
          )}

          {/* Customer & Location Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Customer Info */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Thông tin khách hàng</span>
              </div>
              <div className="text-sm font-bold text-slate-100">{order?.userName}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{order?.userPhone}</span>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22c3d3]/15 text-[#22c3d3] hover:bg-[#22c3d3]/25 font-bold text-xs transition-colors cursor-pointer border border-[#22c3d3]/30"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Trao đổi với khách hàng (Socket)</span>
                </button>
              </div>
            </div>

            {/* Receiving Method Info */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hình thức & Vị trí nhận món</span>
              </div>

              {orderType === 'DINE_IN' && (
                <div>
                  <div className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4" />
                    <span>Ăn tại chỗ • {order.tableNumber || 'Bàn 01'}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Khách đang ngồi chờ phục vụ tại bàn
                  </div>
                </div>
              )}

              {orderType === 'TAKEAWAY' && (
                <div>
                  <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4" />
                    <span>Mang đi (PICKUP)</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Mã nhận món:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-black text-sm border border-emerald-500/30">
                      {order.pickupCode || `PK-${order.orderCode?.slice(-4)}`}
                    </span>
                  </div>
                  {order.pickupSlot && (
                    <div className="text-xs text-slate-400 mt-1">
                      Khung giờ hẹn: <span className="text-slate-200">{order.pickupSlot}</span>
                    </div>
                  )}
                </div>
              )}

              {orderType === 'DELIVERY' && (
                <div>
                  <div className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    <span>Giao tận nơi Ký Túc Xá</span>
                  </div>
                  <div className="text-xs text-slate-200 mt-1 font-semibold">
                    {order.deliveryAddressText || 'Phòng 402 - KTX A1'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order?.notes && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
              <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-bold">Ghi chú của khách: </span>
                <span>{order.notes}</span>
              </div>
            </div>
          )}

          {/* Ordered Items List */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Danh sách món ăn ({order?.orderDetails?.length || 0} món)</span>
              <span>Thành tiền</span>
            </div>

            <div className="divide-y divide-slate-800">
              {order?.orderDetails?.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        item.productImage ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={item.productName}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <span className="text-emerald-400 font-mono font-black">{item.quantity}x</span>
                        <span>{item.productName}</span>
                      </div>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="mt-1 space-y-0.5 pl-5">
                          {item.selectedOptions.map((opt: any, oIdx: number) => (
                            <div key={oIdx} className="text-[11px] text-slate-400">
                              + {opt.optionName || opt.itemName}
                              {opt.price ? ` (+${opt.price.toLocaleString('vi-VN')}đ)` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-slate-200">
                      {item.itemSubtotal?.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.unitPrice?.toLocaleString('vi-VN')}đ / phần
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Tạm tính món ăn:</span>
              <span className="font-mono text-slate-300">
                {order?.totalAmount?.toLocaleString('vi-VN')}đ
              </span>
            </div>
            {order?.discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span>Giảm giá khuyến mãi:</span>
                <span className="font-mono">
                  -{order.discountAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            )}
            <div className="border-t border-slate-800 pt-2 flex items-center justify-between font-bold text-base text-slate-100">
              <span>Tổng thanh toán:</span>
              <span className="font-mono text-emerald-400 text-lg">
                {order?.finalAmount?.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/60">
              <span className="text-slate-400">Phương thức:</span>
              <span className="font-semibold text-slate-200">
                {order?.paymentMethod === 'CAMPUS_WALLET'
                  ? 'Ví Sinh Viên UniPay'
                  : order?.paymentMethod === 'MOMO'
                    ? 'Ví MoMo'
                    : order?.paymentMethod === 'VNPAY'
                      ? 'Cổng VNPay'
                      : 'Tiền mặt tại quầy'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Trạng thái thanh toán:</span>
              {order?.isPaid ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Đã thanh toán đủ
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Chờ thu tiền tại quầy
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            {(status === 'PENDING' || status === 'CONFIRMED') && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                disabled={actionLoading}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Transition buttons according to current status and receive method */}
            {status === 'PENDING' && (
              <button
                onClick={() => handleUpdateStatus('CONFIRMED')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                {actionLoading ? 'Đang lưu...' : 'Duyệt đơn & Chuyển sang POS bếp'}
              </button>
            )}

            {status === 'CONFIRMED' && (
              <span className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Đơn đã duyệt • Đang ở màn hình POS bếp chờ nấu</span>
              </span>
            )}

            {status === 'PREPARING' && (
              <span className="px-3 py-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>POS bếp đang nấu món • Chờ nấu xong đẩy về</span>
              </span>
            )}

            {status === 'READY' && orderType === 'TAKEAWAY' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCallCustomer}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isCallingCustomer
                    ? 'bg-cyan-500 text-white animate-pulse'
                    : 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950'
                    }`}
                  title="Phát loa gọi khách đến quầy nhận món"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Loa gọi khách</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{actionLoading ? 'Đang lưu...' : 'Đã trả khách tại quầy (Hoàn tất)'}</span>
                </button>
              </div>
            )}

            {status === 'READY' && orderType === 'DELIVERY' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('DELIVERING')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>{actionLoading ? 'Đang lưu...' : 'Bắt đầu mang đi giao KTX'}</span>
              </button>
            )}

            {status === 'READY' && orderType === 'DINE_IN' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('SERVED')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Utensils className="w-4 h-4" />
                <span>{actionLoading ? 'Đang lưu...' : 'Giao ra bàn cho khách'}</span>
              </button>
            )}

            {status === 'SERVED' && orderType === 'DINE_IN' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('COMPLETED')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{actionLoading ? 'Đang lưu...' : 'Hoàn thành đơn hàng'}</span>
              </button>
            )}

            {(status === 'WAITING_PICKUP' || status === 'DELIVERING') && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('COMPLETED')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionLoading ? 'Đang lưu...' : 'Xác nhận hoàn tất đơn hàng'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Cancellation Reason Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Xác nhận hủy đơn hàng #{order?.orderCode}</span>
                </h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Chọn lý do hủy đơn:
                </label>
                <div className="space-y-1.5">
                  {[
                    'Hết nguyên liệu chế biến',
                    'Bếp quá tải vào giờ cao điểm',
                    'Khách hàng gọi điện yêu cầu hủy',
                    'Lý do khác...',
                  ].map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer text-xs"
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        checked={cancelReason === r}
                        onChange={() => setCancelReason(r)}
                        className="text-emerald-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                {cancelReason === 'Lý do khác...' && (
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Nhập lý do chi tiết..."
                    rows={2}
                    className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs"
                >
                  {actionLoading ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Order Live Chat Modal */}
        {order && (
          <OrderChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            orderId={order.id}
            orderCode={order.orderCode}
            currentUserRole="STAFF"
            currentUserName="Nhân viên Căn tin"
            currentUserId="staff-current"
            targetUserName={order.userName || 'Khách hàng'}
            canteenName={order.canteenName || 'Căn tin Trường'}
          />
        )}
      </div>
    </div>
  );
};
