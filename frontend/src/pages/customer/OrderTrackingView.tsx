import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { HeaderNav } from '../../components/HeaderNav';
import {
  ArrowLeft,
  ChevronRight,
  Store,
  MapPin,
  FileText,
  Package,
  Home,
  LifeBuoy,
  Receipt,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Shield,
  Star,
  Check,
  ShoppingBag,
  RotateCcw,
  MessageSquare,
  Utensils,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { OrderChatModal } from '../../components/OrderChatModal';
import { adminService, apiClient } from '../../services/api';

interface OrderTrackingViewProps {
  orderId?: string;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ orderId: propOrderId }) => {
  const {
    currentUser,
    viewParams,
    orders,
    navigateTo,
    showToast,
    updateOrderStatus,
    cancelOrder,
    addToCart,
  } = useApp();

  const [isChatOpen, setIsChatOpen] = useState(false);

  const targetOrderId = propOrderId || viewParams?.orderId;
  const order = orders.find((o) => o.id === targetOrderId) || orders[0];

  // Sub-pages: 'TRACKING' (default) | 'CANCEL_REASON'
  const [activePage, setActivePage] = useState<'TRACKING' | 'CANCEL_REASON'>('TRACKING');

  // Cancel reason states
  const [selectedReason, setSelectedReason] = useState<string>(
    'Tôi muốn thay đổi món / đổi số lượng món'
  );
  const [customReasonNote, setCustomReasonNote] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Detail accordion toggle
  const [showItemsDetail, setShowItemsDetail] = useState(false);

  // Review states for completed orders
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [existingOrderReview, setExistingOrderReview] = useState<any>(null);

  // Load existing review for this order from MySQL DB
  useEffect(() => {
    const fetchExistingReview = async () => {
      if (!order?.id) return;
      try {
        const res: any = await apiClient.get('/reviews', { orderId: order.id });
        if (res && res.data && res.data.length > 0) {
          const rev = res.data[0];
          setExistingOrderReview(rev);
          setReviewSubmitted(true);
          setRating(Number(rev.rating) || 5);
          if (rev.comment) setReviewComment(rev.comment);
        }
      } catch (err) {
        console.warn('Could not load order review:', err);
      }
    };
    fetchExistingReview();
  }, [order?.id]);

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy đơn hàng</h2>
        <p className="text-xs text-slate-500">
          Có thể đơn hàng đã được cập nhật hoặc không tồn tại.
        </p>
        <button
          onClick={() => navigateTo('orders')}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Xem danh sách đơn hàng
        </button>
      </div>
    );
  }

  // Formatting estimated delivery time (e.g., 13:03 or +20 mins from order creation)
  const getEstimatedTimeDisplay = () => {
    if (order.estimatedTime && order.estimatedTime.includes(':')) {
      return order.estimatedTime;
    }
    const createdDate = new Date();
    createdDate.setMinutes(createdDate.getMinutes() + 20);
    return createdDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const estimatedTime = getEstimatedTimeDisplay();

  // Copy order code helper
  const handleCopyOrderCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.orderNumber);
  };

  // Payment method display
  const getPaymentMethodDisplay = () => {
    switch (order.paymentMethod) {
      case 'CASH':
        return 'Tiền mặt/QR';
      case 'STUDENT_WALLET':
        return 'Ví Sinh Viên';
      case 'VNPAY_QR':
        return 'VNPAY QR';
      case 'MOMO':
        return 'Ví MoMo';
      default:
        return 'Tiền mặt/QR';
    }
  };

  const totalItemCount = order.items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  // Handle staff confirmation simulation
  const handleSimulateStaffConfirm = () => {
    updateOrderStatus(order.id, 'CONFIRMED');
    showToast('👩‍🍳 Nhân viên căng tin đã xác nhận đơn hàng!', 'success');
  };

  // Handle re-order
  const handleReorder = () => {
    order.items.forEach((it) => {
      if (it.food) {
        addToCart(it.food, it.quantity || 1, it.selectedSize, it.selectedToppings, it.notes);
      }
    });
    showToast('Đã thêm các món vào giỏ hàng!', 'success');
    navigateTo('cart');
  };

  // Handle Confirm Cancellation
  const handleConfirmCancel = () => {
    setIsCancelling(true);
    const finalReason =
      selectedReason === 'Lý do khác' && customReasonNote.trim()
        ? `Lý do khác: ${customReasonNote.trim()}`
        : selectedReason;

    setTimeout(() => {
      cancelOrder(order.id, finalReason);
      setIsCancelling(false);
      setActivePage('TRACKING');
      showToast('Đã huỷ đơn hàng thành công.', 'info');
    }, 400);
  };

  // Review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewSubmitted) {
      showToast('Đơn hàng này đã được đánh giá rồi!', 'info');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const primaryItem = order.items?.[0];
      const targetType = primaryItem?.food ? 'PRODUCT' : 'CANTEEN';
      const targetId = primaryItem?.food ? primaryItem.food.id : (order.canteenId || 'can-1');
      const finalComment = reviewComment.trim() || `Đánh giá ${rating} sao cho đơn hàng #${order.orderNumber}`;

      const res = await adminService.submitStudentReview({
        targetType,
        targetId,
        rating,
        comment: finalComment,
        orderId: order.id,
        userId: currentUser?.id,
        userName: currentUser?.name,
      });

      setExistingOrderReview(res?.data || {
        rating,
        comment: finalComment,
        orderId: order.id,
        userName: currentUser?.name || 'Bạn',
      });
      setReviewSubmitted(true);
      showToast('Cảm ơn bạn đã gửi đánh giá! Ý kiến của bạn đã được ghi nhận vào hệ thống.', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Có lỗi khi gửi đánh giá';
      if (msg.includes('đã được đánh giá')) {
        setReviewSubmitted(true);
        showToast('Đơn hàng này đã được bạn đánh giá rồi!', 'info');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Determine Stepper State
  const isPending = order.status === 'PENDING';
  const isConfirmed = [
    'CONFIRMED',
    'PREPARING',
    'READY',
    'DELIVERING',
    'SERVED',
    'COMPLETED',
  ].includes(order.status);
  const isDeliveringOrReady = [
    'READY',
    'DELIVERING',
    'SERVED',
    'COMPLETED',
  ].includes(order.status);
  const isCompleted = ['SERVED', 'COMPLETED'].includes(order.status);
  const isCancelled = order.status === 'CANCELLED';

  /* ========================================================================= */
  /* PAGE 2: LÝ DO HUỶ ĐƠN ĐẶT HÀNG (FULL PAGE VIEW SEPARATE FROM POPUP)       */
  /* ========================================================================= */
  if (activePage === 'CANCEL_REASON') {
    const cancelReasons = [
      'Tôi muốn thay đổi món / đổi số lượng món',
      'Thời gian chờ quán xác nhận / giao hàng quá lâu',
      'Tôi nhập sai địa chỉ hoặc số điện thoại',
      'Tôi đổi ý, không có nhu cầu ăn nữa',
      'Tôi muốn áp dụng mã giảm giá khác',
      'Đặt nhầm hình thức thanh toán',
      'Lý do khác',
    ];

    return (
      <div className="min-h-screen bg-[#f8fafc] pb-28">
        {/* Top Header */}
        <HeaderNav
          title="Lý do huỷ đơn"
          onBack={() => setActivePage('TRACKING')}
        />

        <main className="max-w-md mx-auto px-4 py-4 space-y-4">
          {/* Status Alert */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
            <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Đơn hàng chưa được quán xác nhận</p>
              <p className="text-amber-800 leading-relaxed">
                Bạn có thể huỷ đơn hàng miễn phí lúc này mà không phát sinh bất kỳ khoản phí nào.
                {order.paymentMethod === 'STUDENT_WALLET' && (
                  <span className="block font-semibold text-emerald-700 mt-1">
                    ✓ Số tiền{' '}
                    <span className="font-bold">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </span>{' '}
                    sẽ được hoàn trả ngay lập tức vào Ví Sinh Viên của bạn!
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Reason Selection Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
            <h2 className="text-[14px] font-bold text-slate-900">
              Vui lòng chọn lý do huỷ đơn:
            </h2>
            <p className="text-[12px] text-slate-500">
              Ý kiến của bạn sẽ giúp UniEat và Căng tin nâng cao chất lượng dịch vụ:
            </p>

            <div className="space-y-2.5 pt-1">
              {cancelReasons.map((reason, idx) => {
                const isSelected = selectedReason === reason;
                return (
                  <label
                    key={idx}
                    onClick={() => setSelectedReason(reason)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                      ? 'border-[#22c3d3] bg-[#22c3d3]/5 text-slate-900 font-medium shadow-2xs'
                      : 'border-slate-200/70 hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <span className="text-[13px] pr-2">{reason}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected
                        ? 'border-[#22c3d3] bg-[#22c3d3] text-white'
                        : 'border-slate-300 bg-white'
                        }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Custom Reason input */}
            {selectedReason === 'Lý do khác' && (
              <div className="pt-2 space-y-1.5 animate-in fade-in duration-200">
                <label className="text-[12px] font-semibold text-slate-700">
                  Ghi chú chi tiết lý do huỷ:
                </label>
                <textarea
                  value={customReasonNote}
                  onChange={(e) => setCustomReasonNote(e.target.value)}
                  placeholder="Nhập chi tiết lý do huỷ của bạn..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#22c3d3] resize-none"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Policy note */}
          <p className="text-[11px] text-slate-400 text-center px-4 leading-relaxed">
            Lưu ý: Sau khi xác nhận huỷ đơn, nhà bếp căng tin sẽ không tiếp nhận nấu đơn này nữa.
            Bạn có thể đặt lại đơn mới bất cứ lúc nào.
          </p>
        </main>

        {/* Fixed Sticky Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-4 py-3">
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
            <button
              onClick={() => setActivePage('TRACKING')}
              className="w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Giữ lại đơn
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
            >
              {isCancelling ? 'Đang huỷ...' : 'Xác nhận huỷ đơn'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* PAGE 1: MÀN HÌNH THEO DÕI ĐƠN HÀNG (MATCHING SCREENSHOT 1 & SCREENSHOT 2)  */
  /* ========================================================================= */
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Top Header Navigation */}
      <HeaderNav
        title="Chi tiết đơn hàng"
        onBack={() => navigateTo('orders')}
      />

      <main className="max-w-md mx-auto px-4 space-y-3.5">
        {/* =============================================================== */}
        {/* HERO SECTION: 3D Driver cards illustration (Matching Screenshot 1)*/}
        {/* =============================================================== */}
        <div className="relative pt-2 pb-4 overflow-hidden rounded-3xl bg-gradient-to-b from-[#dff8fa] via-[#eafafb] to-[#f8fafc] border border-cyan-100/60 shadow-2xs">
          {/* Subtle radial glow background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#22c3d3]/20 rounded-full blur-2xl pointer-events-none" />

          {/* 3 Driver cards floating in perspective */}
          <div className="relative flex items-center justify-center gap-2 pt-2 pb-2">
            {/* Left card tilted */}
            <div className="w-20 h-28 rounded-2xl bg-white/70 backdrop-blur-xs border border-white/80 shadow-xs -rotate-6 scale-90 flex flex-col items-center justify-center p-2 opacity-70">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-bold text-slate-600">Căng tin</span>
              <span className="text-[8px] text-emerald-600 font-semibold">Sẵn sàng</span>
            </div>

            {/* Center card: 3D Driver Avatar with cyan glow border */}
            <div className="w-32 h-40 rounded-2xl bg-white border-2 border-[#22c3d3] shadow-md shadow-[#22c3d3]/20 flex flex-col items-center justify-center p-2.5 z-10 scale-100 transition-transform">
              <div className="relative w-18 h-18 rounded-2xl bg-gradient-to-tr from-cyan-100 to-sky-200 p-1 flex items-center justify-center shadow-inner overflow-hidden">
                {/* 3D Illustrated Driver Avatar with cyan shirt & smile */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                  alt="Driver"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
                  }}
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="text-center mt-2 space-y-0.5">
                <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                  Tài xế Căng tin
                </span>
              </div>
            </div>

            {/* Right card tilted */}
            <div className="w-20 h-28 rounded-2xl bg-white/70 backdrop-blur-xs border border-white/80 shadow-xs rotate-6 scale-90 flex flex-col items-center justify-center p-2 opacity-70">
              <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-[#22c3d3] mb-1">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-bold text-slate-600">Giao hàng</span>
              <span className="text-[8px] text-[#22c3d3] font-semibold">Tận nơi</span>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* STATUS & STEPPER CARD (Matching Screenshot 1 & Screenshot 2)     */}
        {/* =============================================================== */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
          {/* Estimated time */}
          <div className="text-center">
            <span className="text-[14px] text-slate-700">
              Dự kiến giao đến lúc{' '}
              <span className="font-bold text-[#22c3d3] text-[16px]">{estimatedTime}</span>
            </span>
          </div>

          {/* Stepper Bar (4 icons with connecting lines) */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            {/* Step 1: Document / Bill */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-colors ${!isCancelled ? 'bg-[#22c3d3] text-white' : 'bg-slate-200 text-slate-500'
                  }`}
              >
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* Connecting line 1 */}
            <div
              className={`flex-1 h-[2.5px] mx-1 rounded-full transition-colors ${!isCancelled ? 'bg-[#22c3d3]' : 'bg-slate-200'
                }`}
            />

            {/* Step 2: Store / Canteen */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isConfirmed && !isCancelled
                  ? 'bg-[#22c3d3] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400'
                  }`}
              >
                <Store className="w-5 h-5 stroke-[2]" />
              </div>
            </div>

            {/* Connecting line 2 */}
            <div
              className={`flex-1 h-[2.5px] mx-1 rounded-full transition-colors ${isDeliveringOrReady && !isCancelled ? 'bg-[#22c3d3]' : 'bg-slate-200'
                }`}
            />

            {/* Step 3: Package */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDeliveringOrReady && !isCancelled
                  ? 'bg-[#22c3d3] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400'
                  }`}
              >
                <Package className="w-5 h-5 stroke-[2]" />
              </div>
            </div>

            {/* Connecting line 3 */}
            <div
              className={`flex-1 h-[2.5px] mx-1 rounded-full transition-colors ${isCompleted && !isCancelled ? 'bg-[#22c3d3]' : 'bg-slate-200'
                }`}
            />

            {/* Step 4: Home */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isCompleted && !isCancelled
                  ? 'bg-[#22c3d3] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400'
                  }`}
              >
                <Home className="w-5 h-5 stroke-[2]" />
              </div>
            </div>
          </div>

          {/* Status Title & Subtitle */}
          <div className="text-center space-y-1 pt-1 border-t border-slate-50">
            <h2 className="text-[19px] font-black text-slate-900 tracking-tight">
              {isPending
                ? 'Đang đợi nhân viên xác nhận'
                : order.status === 'CONFIRMED'
                  ? 'Căng tin đã xác nhận'
                  : order.status === 'PREPARING'
                    ? 'Nhà bếp đang nấu'
                    : order.status === 'DELIVERING'
                      ? 'Đang giao hàng'
                      : order.status === 'READY'
                        ? 'Món ăn sẵn sàng'
                        : order.status === 'SERVED'
                          ? 'Đã phục vụ tại bàn'
                          : order.status === 'COMPLETED'
                            ? 'Đã hoàn thành'
                            : 'Đơn hàng đã hủy'}
            </h2>

            {isPending && (
              <div className="flex flex-col items-center justify-center gap-1 text-slate-500 text-[13px] pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="font-semibold text-slate-700">Đơn hàng đang chờ nhân viên kiểm duyệt...</span>
                </div>
                <span className="text-[12px] text-slate-400 font-normal">
                  (Chưa được xác nhận — bạn có thể bấm hủy ở bên dưới nếu muốn)
                </span>
              </div>
            )}

            {order.status === 'CONFIRMED' && (
              <p className="text-[13px] text-emerald-600 font-medium">
                Căng tin đã nhận phiếu và đang chuẩn bị chế biến
              </p>
            )}

            {isCancelled && (
              <p className="text-[12px] text-rose-600 font-medium">
                {order.notes ? order.notes : 'Đơn hàng đã bị hủy theo yêu cầu của bạn.'}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Card 1: Store & Destination */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-4">
            {/* Store line */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[14px] text-slate-900 truncate">
                    {order.canteenName || 'Căng Tin A - Giảng Đường Trung Tâm A2'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <p className="text-[12px] text-slate-500 line-clamp-1 mt-0.5">
                  Tầng 1 Tòa Giảng Đường A2, Khuôn Viên Đại Học
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Delivery address line */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px] text-slate-800 leading-snug">
                  {order.orderType === 'DINE_IN'
                    ? `Ăn tại bàn: ${order.tableInfo?.tableName || 'Bàn căng tin'}`
                    : order.orderType === 'PICKUP'
                      ? `Nhận tại quầy: ${order.pickupTimeSlot || 'Quầy số 1'}`
                      : order.deliveryAddress
                        ? `${order.deliveryAddress.building} - ${order.deliveryAddress.room}, ${order.deliveryAddress.campus}`
                        : 'KTX A1 - Phòng 402, Ký Túc Xá Sinh Viên ĐHQG'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {order.userName} • {order.userPhone || '0912 345 678'} • 0.38km
                </p>
              </div>
            </div>

            {/* Realtime Chat with Canteen Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] text-slate-500 font-medium">Nhân viên trực tuyến</span>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22c3d3]/10 text-[#0891b2] hover:bg-[#22c3d3]/20 font-bold text-[12px] transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Nhắn tin căn tin</span>
              </button>
            </div>
          </div>

          {/* Card 2: Tóm tắt đơn */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-[14px] text-slate-900">Tóm tắt đơn</h3>

            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-700">
                {totalItemCount} món •{' '}
                <span className="font-bold text-slate-900">
                  {order.totalAmount.toLocaleString('vi-VN')}đ
                </span>{' '}
                • 💵 {getPaymentMethodDisplay()}
              </span>
              <button
                onClick={() => setShowItemsDetail(!showItemsDetail)}
                className="text-[#22c3d3] font-bold text-[13px] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Xem chi tiết đơn</span>
                {showItemsDetail ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Accordion showing full order items breakdown */}
            {showItemsDetail && (
              <div className="pt-2 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-200">
                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="pt-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-800">
                          {it.quantity}x {it.food.name}
                        </p>
                        {it.selectedSize && (
                          <p className="text-[10px] text-slate-400">Size: {it.selectedSize.name}</p>
                        )}
                        {it.selectedToppings && it.selectedToppings.length > 0 && (
                          <p className="text-[10px] text-slate-500">
                            Topping: {it.selectedToppings.map((t) => t.name).join(', ')}
                          </p>
                        )}
                        {it.notes && (
                          <p className="text-[10px] text-amber-600 italic">Note: {it.notes}</p>
                        )}
                      </div>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {((it.unitPrice || it.food.price) * it.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Tạm tính ({totalItemCount} món)</span>
                    <span>{order.subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {order.shippingFee > 0 && (
                    <div className="flex justify-between">
                      <span>Phí giao hàng</span>
                      <span>{order.shippingFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Mã giảm giá đã áp dụng</span>
                      <span>-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-100">
                    <span>Tổng thanh toán</span>
                    <span className="text-[#22c3d3]">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-100" />

            {/* Mã đơn line */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[13px] text-slate-600">Mã đơn</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-mono font-medium text-slate-800">
                  {order.orderNumber}
                </span>
                <button
                  onClick={handleCopyOrderCode}
                  className="text-[#22c3d3] hover:text-[#1db3c1] p-1 rounded-md transition-colors cursor-pointer"
                  title="Sao chép mã đơn"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Khác */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-[14px] text-slate-900">Khác</h3>

            {/* Hỗ trợ an toàn chuyến */}
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-50 -mx-2 p-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-cyan-50 text-[#009ca8] flex items-center justify-center">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <span className="text-[13px] text-slate-800 font-medium">
                  Hỗ trợ an toàn chuyến
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <div className="border-t border-slate-100" />

            {/* Yêu cầu xuất hoá đơn */}
            <div className="flex items-center justify-between cursor-pointer hover:bg-slate-50 -mx-2 p-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[13px] text-slate-800 font-medium block">
                    Yêu cầu xuất hoá đơn
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Xuất hoá đơn không có tên công ty.
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Review form if order is completed / served */}
          {['COMPLETED', 'SERVED'].includes(order.status) && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[14px] text-slate-900 flex items-center gap-1.5">
                  <span>⭐ Đánh giá bữa ăn</span>
                </h3>
                {reviewSubmitted && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Đã đánh giá (1 lần)
                  </span>
                )}
              </div>

              {reviewSubmitted ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center justify-between font-bold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Cảm ơn bạn đã gửi đánh giá cho đơn hàng này!</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= (existingOrderReview?.rating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 fill-slate-100'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {(existingOrderReview?.comment || reviewComment) && (
                    <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium">
                      "{existingOrderReview?.comment || reviewComment}"
                    </div>
                  )}

                  {/* PHẢN HỒI TỪ NHÀ HÀNG / CĂNG TIN */}
                  {(existingOrderReview?.replyText || existingOrderReview?.reply) ? (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-amber-600" />
                          Phản hồi từ Nhà hàng / Căng tin:
                        </span>
                        {existingOrderReview?.repliedAt && (
                          <span className="text-[10px] text-amber-700/80 font-medium">
                            {new Date(existingOrderReview.repliedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed font-medium pl-4 border-l-2 border-amber-400">
                        {existingOrderReview.replyText || existingOrderReview.reply}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-50/50 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 flex items-center gap-1.5">
                      <span>💬 Căng tin đã nhận được đánh giá và sẽ sớm gửi phản hồi đến bạn.</span>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <p className="text-[11px] text-slate-500">
                    Đơn hàng đã hoàn thành. Hãy chia sẻ cảm nhận chất lượng món ăn (chỉ đánh giá 1 lần duy nhất):
                  </p>
                  <div className="flex items-center justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 cursor-pointer transition-transform hover:scale-115 active:scale-90 ${star <= rating ? 'text-amber-500' : 'text-slate-300'
                          }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Nhập cảm nhận của bạn về món ăn (tuỳ chọn)..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingReview ? 'Đang gửi đánh giá...' : 'Gửi đánh giá bữa ăn'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* BOTTOM CANCELLATION BUTTON (Matching Screenshot 2)               */}
          {/* If unconfirmed (PENDING): shows "Huỷ đơn đặt" button             */}
          {/* If already confirmed: shows disabled note that kitchen is cooking*/}
          {/* If already cancelled: shows "Đặt lại đơn" button                 */}
          {/* =============================================================== */}
          <div className="pt-2 text-center">
            {isPending && (
              <div className="space-y-2">
                <button
                  id="cancel-order-button"
                  onClick={() => setActivePage('CANCEL_REASON')}
                  className="w-full py-3.5 px-4 text-center font-bold text-[15px] text-slate-800 hover:text-rose-600 hover:bg-rose-50/50 rounded-2xl transition-colors cursor-pointer"
                >
                  Huỷ đơn đặt
                </button>
                <p className="text-[11px] text-slate-400">
                  Bạn có thể huỷ đơn miễn phí trong lúc chờ căng tin xác nhận
                </p>
              </div>
            )}

            {!isPending && !isCancelled && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">
                  Đơn hàng đã được quán xác nhận và đang chế biến
                </p>
                <p className="text-[11px] text-slate-400">
                  Không thể tự hủy đơn lúc này. Vui lòng liên hệ căng tin nếu cần hỗ trợ khẩn cấp.
                </p>
              </div>
            )}

            {isCancelled && (
              <div className="space-y-3">
                <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-center space-y-1 text-rose-800">
                  <p className="text-xs font-bold">Đơn hàng đã bị hủy</p>
                  <p className="text-[11px] text-rose-600">
                    {order.paymentMethod === 'STUDENT_WALLET'
                      ? 'Tiền đã được hoàn lại đầy đủ vào Ví Sinh Viên.'
                      : 'Đơn hàng không phát sinh bất kỳ khoản phí nào.'}
                  </p>
                </div>

                <button
                  onClick={handleReorder}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Đặt lại các món này
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Realtime Order Chat Drawer/Modal */}
      {order && (
        <OrderChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          orderId={order.id}
          orderCode={order.orderNumber}
          currentUserRole="CUSTOMER"
          currentUserName={currentUser?.name || 'Khách hàng'}
          currentUserId={currentUser?.id || 'cust-1'}
          targetUserName="Nhân viên Căn tin"
          canteenName={order.canteenName || 'Căn tin Trường'}
        />
      )}
    </div>
  );
};
