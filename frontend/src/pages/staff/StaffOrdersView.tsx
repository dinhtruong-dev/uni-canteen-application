import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Receipt,
  Utensils,
  PackageCheck,
  Truck,
  Eye,
  CheckCircle2,
  Clock,
  QrCode,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  XCircle,
  ChefHat,
  Ban,
  Megaphone,
  Check,
  Flame,
  Sparkles,
} from 'lucide-react';
import { staffService, kdsService } from '../../services/api';
import { getSocket } from '../../services/socket.client';
import { StaffOrderDetailModal } from './StaffOrderDetailModal';
import { PickupVerificationModal } from '../../components/staff/PickupVerificationModal';

export const StaffOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [receiveMethod, setReceiveMethod] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected order for detail modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [callingOrderId, setCallingOrderId] = useState<string | null>(null);

  const handleCallCustomer = async (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    setCallingOrderId(order.id);
    try {
      await kdsService.callCustomer(order.id);
    } catch (err) {
      console.error('Call customer failed:', err);
    } finally {
      setTimeout(() => setCallingOrderId(null), 2500);
    }
  };

  const readyOrdersCount = orders.filter(
    (o) => o.status === 'READY' || o.status === 'WAITING_PICKUP' || o.status === 'DELIVERING'
  ).length;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await staffService.getOrders({
        canteenId: 'cant-a',
        receiveMethod: receiveMethod === 'ALL' ? undefined : receiveMethod,
        status: status === 'ALL' ? undefined : status,
        paymentStatus: paymentStatus === 'ALL' ? undefined : paymentStatus,
        search: search.trim() || undefined,
        page,
        limit: 15,
      });

      if (res.success) {
        setOrders(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [receiveMethod, status, paymentStatus, page]);

  // Real-time Socket.IO synchronization
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleNewOrder = (orderData: any) => {
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === orderData.id || o.orderCode === orderData.orderCode);
          if (exists) return prev;
          return [orderData, ...prev];
        });
        setTotal((prev) => prev + 1);
      };

      const handleStatusUpdated = (orderData: any) => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderData.id || o.orderCode === orderData.orderCode
              ? { ...o, ...orderData }
              : o
          )
        );
      };

      const handleOrderCancelled = (data: any) => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === data.orderId || o.orderCode === data.orderCode
              ? { ...o, status: 'CANCELLED' }
              : o
          )
        );
      };

      socket.on('order:new', handleNewOrder);
      socket.on('order:status_updated', handleStatusUpdated);
      socket.on('order:cancelled', handleOrderCancelled);

      return () => {
        socket.off('order:new', handleNewOrder);
        socket.off('order:status_updated', handleStatusUpdated);
        socket.off('order:cancelled', handleOrderCancelled);
      };
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleQuickAdvance = async (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    let nextStatus = '';
    if (order.status === 'PENDING') {
      nextStatus = 'CONFIRMED';
    } else if (order.status === 'READY') {
      // Once kitchen finishes cooking (READY), staff delivers/serves according to order type
      if (order.orderType === 'TAKEAWAY') nextStatus = 'COMPLETED';
      else if (order.orderType === 'DELIVERY') nextStatus = 'DELIVERING';
      else if (order.orderType === 'DINE_IN') nextStatus = 'SERVED';
      else nextStatus = 'COMPLETED';
    } else if (order.status === 'SERVED') {
      // Dine-in order done eating -> Clean table & complete order
      nextStatus = 'COMPLETED';
    } else if (order.status === 'WAITING_PICKUP' || order.status === 'DELIVERING') {
      nextStatus = 'COMPLETED';
    }

    if (!nextStatus) return;

    try {
      const res = await staffService.updateOrderStatus(order.id, nextStatus);
      if (res.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Quick advance error:', err);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              DANH SÁCH ĐƠN HÀNG
            </span>
            <span className="text-xs text-slate-400">Tổng cộng {total} đơn hàng</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1">Quản lý Đơn Hàng Căn Tin</h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsPickupModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Quét / Nhập mã nhận món (PICKUP)</span>
          </button>
        </div>
      </div>

      {/* Ready Orders Callout Banner */}
      {readyOrdersCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-2 border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl shadow-emerald-950/30">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <div>
              <h4 className="text-sm font-black text-emerald-300 flex items-center gap-2">
                <span>Bếp đã nấu xong ({readyOrdersCount} đơn hàng sẵn sàng)!</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Mời nhân viên bấm loa gọi khách nhận tại quầy hoặc bắt đầu giao tận phòng KTX
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStatus('READY');
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-all shadow-md"
          >
            Lọc đơn sẵn sàng ({readyOrdersCount})
          </button>
        </div>
      )}

      {/* Filter Tabs by Receive Method */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'Tất cả đơn', icon: Receipt },
          { id: 'DINE_IN', label: 'Ăn tại bàn', icon: Utensils },
          { id: 'TAKEAWAY', label: 'Mang đi (Pickup)', icon: PackageCheck },
          { id: 'DELIVERY', label: 'Giao tận nơi KTX', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = receiveMethod === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setReceiveMethod(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Bar: Status, Payment, Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách, SĐT..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Trạng thái:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt (Pending)</option>
              <option value="CONFIRMED">Đã nhận (Confirmed)</option>
              <option value="PREPARING">Đang nấu (Preparing)</option>
              <option value="READY">Sẵn sàng (Ready)</option>
              <option value="SERVED">Đã ra bàn / Đang ăn (Served)</option>
              <option value="WAITING_PICKUP">Chờ lấy món (Waiting Pickup)</option>
              <option value="DELIVERING">Đang giao KTX (Delivering)</option>
              <option value="COMPLETED">Hoàn thành (Completed)</option>
              <option value="CANCELLED">Đã hủy (Cancelled)</option>
            </select>
          </div>

          {/* Payment Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Thanh toán:</span>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả thanh toán</option>
              <option value="PAID">Đã thanh toán (Paid)</option>
              <option value="PENDING">Chờ thanh toán (Pending)</option>
            </select>
          </div>

          <button
            onClick={() => {
              setReceiveMethod('ALL');
              setStatus('ALL');
              setPaymentStatus('ALL');
              setSearch('');
              setPage(1);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã đơn</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Hình thức nhận</th>
                <th className="py-3.5 px-4">Vị trí / Mã nhận</th>
                <th className="py-3.5 px-4">Món đặt</th>
                <th className="py-3.5 px-4">Tổng tiền</th>
                <th className="py-3.5 px-4">Thanh toán</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const methodBadge =
                    order.orderType === 'DINE_IN' ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Ăn tại bàn
                      </span>
                    ) : order.orderType === 'TAKEAWAY' ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Mang đi (Pickup)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Giao KTX
                      </span>
                    );

                  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
                    PENDING: { label: 'Chờ duyệt', bg: 'bg-rose-500/15', text: 'text-rose-400' },
                    CONFIRMED: { label: 'Đã nhận đơn', bg: 'bg-orange-500/15', text: 'text-orange-400' },
                    PREPARING: { label: 'Đang nấu', bg: 'bg-amber-500/15', text: 'text-amber-400' },
                    READY: { label: 'Sẵn sàng', bg: 'bg-sky-500/15', text: 'text-sky-400' },
                    SERVED: { label: 'Đã ra bàn', bg: 'bg-teal-500/15', text: 'text-teal-400' },
                    WAITING_PICKUP: { label: 'Chờ lấy món', bg: 'bg-sky-500/15', text: 'text-sky-400' },
                    DELIVERING: { label: 'Đang giao', bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
                    COMPLETED: { label: 'Hoàn thành', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
                    CANCELLED: { label: 'Đã hủy', bg: 'bg-slate-700/50', text: 'text-slate-400' },
                  };

                  const s = statusConfig[order.status] || {
                    label: order.status,
                    bg: 'bg-slate-800',
                    text: 'text-slate-300',
                  };

                  // Check if order waiting > 15 minutes and still active
                  const isDelayed =
                    order.elapsedMinutes &&
                    order.elapsedMinutes > 15 &&
                    order.status !== 'COMPLETED' &&
                    order.status !== 'CANCELLED';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        #{order.orderCode}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        <div className="font-semibold">{order.userName}</div>
                        <div className="text-[10px] text-slate-400">{order.userPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">{methodBadge}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {order.orderType === 'DINE_IN' && (
                          <span className="font-semibold text-slate-200">{order.tableNumber || 'Bàn 01'}</span>
                        )}
                        {order.orderType === 'TAKEAWAY' && (
                          <span className="font-mono text-emerald-400 font-bold">
                            {order.pickupCode || order.pickupSlot || 'Ca trưa'}
                          </span>
                        )}
                        {order.orderType === 'DELIVERY' && (
                          <span className="text-[11px] text-slate-300 truncate max-w-[130px] block">
                            {order.deliveryAddressText || 'KTX A1'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="font-bold text-slate-200">{order.orderDetails?.length || 1} món</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                          {order.orderDetails?.map((i: any) => i.productName).join(', ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                        {order.finalAmount?.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-3.5 px-4">
                        {order.isPaid ? (
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Đã TT
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Chờ TT
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <span
                          className={
                            isDelayed
                              ? 'text-rose-400 font-bold flex items-center gap-1 animate-pulse'
                              : 'text-slate-400'
                          }
                        >
                          {order.elapsedMinutes !== undefined
                            ? order.elapsedMinutes === 0
                              ? 'Vừa đặt'
                              : `${order.elapsedMinutes} phút`
                            : 'Hôm nay'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Next status quick button */}
                          {order.status === 'PENDING' && (
                            <button
                              onClick={(e) => handleQuickAdvance(e, order)}
                              className="px-2 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-slate-950 font-bold text-[11px] transition-colors"
                            >
                              Duyệt
                            </button>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <span
                              className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium text-[11px] flex items-center gap-1"
                              title="Đã duyệt đơn, chờ bên bếp KDS bấm bắt đầu nấu"
                            >
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Chờ bếp nhận</span>
                            </span>
                          )}
                          {order.status === 'PREPARING' && (
                            <span
                              className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1 animate-pulse"
                              title="Bên bếp KDS đang chế biến, chờ nấu xong"
                            >
                              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span>Đang nấu...</span>
                            </span>
                          )}
                          {order.status === 'READY' && (
                            <div className="flex items-center gap-1">
                              {order.orderType === 'TAKEAWAY' ? (
                                <>
                                  <button
                                    onClick={(e) => handleCallCustomer(e, order)}
                                    className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                                      callingOrderId === order.id
                                        ? 'bg-cyan-500 text-white animate-pulse'
                                        : 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950'
                                    }`}
                                    title="Phát loa / Thông báo đến điện thoại khách"
                                  >
                                    <Megaphone className="w-3 h-3" />
                                    <span>Loa gọi</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleQuickAdvance(e, order)}
                                    className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors"
                                    title="Báo khách đã nhận món"
                                  >
                                    Trả món
                                  </button>
                                </>
                              ) : order.orderType === 'DELIVERY' ? (
                                <>
                                  <button
                                    onClick={(e) => handleQuickAdvance(e, order)}
                                    className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-slate-950 font-bold text-[11px] transition-colors flex items-center gap-1"
                                    title="Bắt đầu giao đến phòng KTX"
                                  >
                                    <Truck className="w-3 h-3" />
                                    <span>Đi giao</span>
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await staffService.updateOrderStatus(order.id, 'COMPLETED');
                                      fetchOrders();
                                    }}
                                    className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors"
                                    title="Xác nhận đã giao tận phòng"
                                  >
                                    Đã giao
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => handleQuickAdvance(e, order)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                                  title="Giao món ăn ra tận bàn cho khách"
                                >
                                  <Utensils className="w-3 h-3" />
                                  <span>Giao ra bàn</span>
                                </button>
                              )}
                            </div>
                          )}
                          {order.status === 'SERVED' && (
                            <button
                              onClick={(e) => handleQuickAdvance(e, order)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                              title="Khách dùng bữa xong - Hoàn thành đơn hàng"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Hoàn thành</span>
                            </button>
                          )}
                          {(order.status === 'WAITING_PICKUP' || order.status === 'DELIVERING') && (
                            <button
                              onClick={(e) => handleQuickAdvance(e, order)}
                              className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors"
                            >
                              Hoàn tất
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60">
          <div>
            Trang <span className="font-bold text-slate-200">{page}</span> /{' '}
            <span className="font-bold text-slate-200">{totalPages}</span> (Tổng {total} đơn)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-bold font-mono">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <StaffOrderDetailModal
          orderId={selectedOrderId}
          isOpen={true}
          onClose={() => {
            setSelectedOrderId(null);
            fetchOrders();
          }}
          onUpdated={() => {
            fetchOrders();
          }}
        />
      )}

      {/* Pickup Verification Modal */}
      <PickupVerificationModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        canteenId="cant-a"
        onSuccess={() => {
          fetchOrders();
        }}
      />
    </div>
  );
};
