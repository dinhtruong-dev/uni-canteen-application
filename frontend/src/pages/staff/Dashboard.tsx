import React, { useState, useEffect } from 'react';
import {
  Inbox,
  ChefHat,
  PackageCheck,
  Truck,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Receipt,
  Clock,
  ArrowRight,
  Eye,
  Store,
  RefreshCw,
  QrCode,
  Tv2,
  AlertTriangle,
  Sparkles,
  Megaphone,
  Check,
  Utensils,
  Flame,
  XCircle,
  Send,
} from 'lucide-react';
import { staffDashboardService } from '../../services/api/staff/dashboard.service';
import { staffOrderService } from '../../services/api/staff/staffOrder.service';
import { kdsService } from '../../services/api/staff/kds.service';
import { getSocket } from '../../services/socket.client';
import { useApp } from '../../store/AppContext';
import { StaffOrderDetailModal } from './OrderDetail';
import { StaffDashboardData, StaffOrder } from '../../types/staff';

export const StaffDashboardView: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await staffDashboardService.getDashboard('cant-a');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching staff dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000); // Polling every 15s

    let cleanup: (() => void) | undefined;
    const bindSocket = () => {
      const socket = getSocket();
      if (!socket) return false;

      const handleRefresh = () => {
        fetchDashboardData();
      };

      socket.on('order:new', handleRefresh);
      socket.on('order:status_updated', handleRefresh);
      socket.on('order:cancelled', handleRefresh);

      cleanup = () => {
        socket.off('order:new', handleRefresh);
        socket.off('order:status_updated', handleRefresh);
        socket.off('order:cancelled', handleRefresh);
      };
      return true;
    };

    if (!bindSocket()) {
      const timer = setInterval(() => {
        if (bindSocket()) clearInterval(timer);
      }, 500);
      return () => {
        clearInterval(interval);
        clearInterval(timer);
        if (cleanup) cleanup();
      };
    }

    return () => {
      clearInterval(interval);
      if (cleanup) cleanup();
    };
  }, []);

  const [callingOrderId, setCallingOrderId] = useState<string | null>(null);

  const handleCallCustomer = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setCallingOrderId(orderId);
    try {
      await kdsService.callCustomer(orderId);
      showToast('Đã phát loa thông báo mời khách nhận món!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể gửi lệnh gọi khách', 'error');
    } finally {
      setTimeout(() => setCallingOrderId(null), 2500);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await staffOrderService.updateOrderStatus(orderId, nextStatus);
      if (res.success) {
        showToast(res.message || `Đã chuyển đơn sang ${nextStatus}`, 'success');
        fetchDashboardData();
      } else {
        showToast(res.message || 'Không thể cập nhật trạng thái đơn', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'Lỗi khi cập nhật trạng thái đơn', 'error');
    }
  };

  const kpis = data?.kpis || {
    newOrders: 0,
    preparing: 0,
    waitingPickup: 0,
    delivering: 0,
    completedToday: 0,
    todayRevenue: 0,
  };

  const recentOrders = data?.recentOrders || [];
  const pendingOrders = (data?.pendingOrders && data.pendingOrders.length > 0)
    ? data.pendingOrders
    : recentOrders.filter((o: any) => o.status === 'PENDING');
  const readyOrders = recentOrders.filter(
    (o: any) => o.status === 'READY' || o.status === 'WAITING_PICKUP' || o.status === 'DELIVERING'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              VẬN HÀNH HÔM NAY
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1 tracking-tight">
            Bảng Điều Khiển Căn Tin A2
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Theo dõi dòng đơn hàng, tốc độ chế biến và xác nhận giao món cho sinh viên
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigateTo('kitchen-kds')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-102"
          >
            <Tv2 className="w-4 h-4 text-amber-400" />
            <span>Màn hình Bếp (KDS)</span>
          </button>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards (6 metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: ĐƠN MỚI */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 hover:border-rose-500/50 transition-all shadow-lg shadow-rose-950/20 group">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold mb-2">
            <span>ĐƠN MỚI</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {kpis.newOrders}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-400/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Cần duyệt ngay
          </div>
        </div>

        {/* KPI 2: ĐANG NẤU / CHUẨN BỊ */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all shadow-lg shadow-amber-950/20 group">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-2">
            <span>ĐANG NẤU</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChefHat className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {kpis.preparing}
          </div>
          <div className="mt-1 text-[11px] text-amber-400/80">Đang tại chảo / bếp</div>
        </div>

        {/* KPI 3: CHỜ NHẬN / SẴN SÀNG */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-sky-500/30 hover:border-sky-500/50 transition-all shadow-lg shadow-sky-950/20 group">
          <div className="flex items-center justify-between text-xs text-sky-400 font-semibold mb-2">
            <span>CHỜ NHẬN</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageCheck className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {kpis.waitingPickup}
          </div>
          <div className="mt-1 text-[11px] text-sky-400/80">Đã lên mâm / tủ giữ ấm</div>
        </div>

        {/* KPI 4: ĐANG GIAO KTX */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/50 transition-all shadow-lg shadow-indigo-950/20 group">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold mb-2">
            <span>ĐANG GIAO</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 font-mono tracking-tight">
            {kpis.delivering}
          </div>
          <div className="mt-1 text-[11px] text-indigo-400/80">Staff đang giao tới KTX</div>
        </div>

        {/* KPI 5: HOÀN THÀNH HÔM NAY */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/50 transition-all shadow-lg shadow-emerald-950/20 group">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
            <span>HOÀN THÀNH</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {kpis.completedToday}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/80">Đơn đã giao thành công</div>
        </div>

        {/* KPI 6: DOANH THU HÔM NAY */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-teal-500/30 hover:border-teal-500/50 transition-all shadow-lg shadow-teal-950/20 group">
          <div className="flex items-center justify-between text-xs text-teal-400 font-semibold mb-2">
            <span>DOANH THU</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4 text-teal-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-300 font-mono tracking-tight truncate">
            {kpis.todayRevenue?.toLocaleString('vi-VN')}đ
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-teal-400/80">
            <TrendingUp className="w-3 h-3 text-teal-400" />
            Đã thanh toán
          </div>
        </div>
      </div>

      {/* 2.4. Dedicated Pending Orders Section - Chờ Nhân Viên Duyệt để gửi vào Máy POS Bếp Nấu */}
      {pendingOrders.length > 0 && (
        <div className="bg-gradient-to-r from-orange-950/80 via-slate-900 to-amber-950/80 border-2 border-orange-500/60 rounded-3xl p-5 shadow-2xl shadow-orange-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-400 animate-ping shrink-0" />
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>ĐƠN MỚI TỪ KHÁCH HÀNG - CẦN DUYỆT ĐƯA VÀO MÁY POS BẾP</span>
                  <span className="px-2 py-0.5 rounded-md bg-orange-500 text-slate-950 text-xs font-black">
                    {pendingOrders.length} ĐƠN ĐANG CHỜ
                  </span>
                </h3>
                <p className="text-xs text-orange-200/90 mt-0.5">
                  Khách hàng vừa đặt đơn! Nhân viên duyệt đơn sẽ cập nhật CSDL MySQL và tự động đồng bộ sang màn hình POS bếp để đầu bếp bắt đầu chế biến.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('staff-orders')}
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Xem tất cả đơn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingOrders.map((order: any) => (
              <div
                key={order.id}
                className="bg-slate-900/95 border-2 border-orange-500/40 hover:border-orange-500 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-orange-400">
                        #{order.orderCode}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        {order.elapsedMinutes !== undefined
                          ? order.elapsedMinutes === 0
                            ? 'Vừa đặt'
                            : `${order.elapsedMinutes} phút trước`
                          : 'Mới'}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      {order.orderType === 'DINE_IN'
                        ? `Bàn ${order.tableNumber || '01'}`
                        : order.orderType === 'DELIVERY'
                          ? `Giao KTX ${order.deliveryAddressText ? `: ${order.deliveryAddressText}` : ''}`
                          : 'Mang đi (Quầy)'}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">
                        Khách: {order.userName} {order.userPhone ? `• ${order.userPhone}` : ''}
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {order.finalAmount?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-800/60 p-2 rounded-xl border border-slate-700/60 space-y-1">
                      {order.orderDetails && order.orderDetails.length > 0 ? (
                        order.orderDetails.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-start text-[11px]">
                            <span className="font-semibold text-slate-200">
                              <span className="text-orange-400 font-bold">{item.quantity}x</span> {item.productName}
                            </span>
                            <span className="text-slate-400 font-mono">
                              {(item.itemSubtotal || item.unitPrice * item.quantity)?.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400">Đơn hàng ẩm thực</p>
                      )}
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-amber-300 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 font-medium">
                        Ghi chú: {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Direct 1-Click Action Buttons for Approval */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/20 cursor-pointer active:scale-95"
                    title="Duyệt đơn và chuyển ngay về máy POS bếp để bắt đầu hiển thị"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Duyệt & Đưa POS Bếp</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Duyệt và bắt đầu nấu luôn tại bếp"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nấu Luôn</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Hủy đơn hàng này"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.5. Dedicated Ready Orders Section ("nấu xong rồi nhân viên sẽ nhận được những đơn sẵn sàng rồi giao hay làm gì đấy từ nhân viên") */}
      {readyOrders.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-2 border-emerald-500/50 rounded-3xl p-5 shadow-2xl shadow-emerald-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>ĐƠN SẴN SÀNG CHỜ PHỤC VỤ & GIAO ĐI</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-xs font-black">
                    {readyOrders.length} ĐƠN
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Bếp đã nấu xong! Mời nhân viên phát loa gọi khách lấy tại quầy hoặc mang đi giao tận phòng KTX
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('staff-orders')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Xem chi tiết danh sách</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyOrders.map((order: any) => (
              <div
                key={order.id}
                className="bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <span className="font-mono text-sm font-black text-emerald-400">
                      #{order.orderCode}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {order.orderType === 'DINE_IN'
                        ? `Bàn ${order.tableNumber || '01'}`
                        : order.orderType === 'DELIVERY'
                          ? `Giao KTX ${order.deliveryAddressText ? `: ${order.deliveryAddressText}` : ''}`
                          : 'Mang đi (Quầy)'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-bold text-slate-200 truncate">
                      Khách: {order.userName} {order.userPhone ? `• ${order.userPhone}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      Món: {order.orderDetails?.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </p>
                    {order.notes && (
                      <p className="text-[10px] text-amber-300 bg-amber-500/10 p-1 rounded font-medium">
                        Khách dặn: {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Direct Action Buttons for Staff */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  {order.orderType === 'TAKEAWAY' ? (
                    <>
                      <button
                        onClick={(e) => handleCallCustomer(e, order.id)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${callingOrderId === order.id
                          ? 'bg-cyan-500 text-white animate-pulse'
                          : 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950'
                          }`}
                        title="Phát loa thông báo khách qua app và quầy"
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>Loa gọi</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Trả món</span>
                      </button>
                    </>
                  ) : order.orderType === 'DELIVERY' ? (
                    <>
                      {order.status === 'READY' ? (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERING')}
                          className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-slate-950 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Đi giao KTX</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-purple-400 px-2 py-1 bg-purple-500/10 rounded-lg">
                          🛵 Đang giao KTX
                        </span>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Đã giao xong</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      className="w-full py-1.5 px-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Đã bưng ra bàn</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Recent Orders Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Đơn hàng mới nhận gần đây</h3>
              <p className="text-xs text-slate-400">10 đơn hàng phát sinh gần nhất cần theo dõi</p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('staff-orders')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition-colors"
          >
            <span>Xem tất cả đơn hàng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Hình thức nhận</th>
                <th className="py-3 px-4">Vị trí / Mã nhận</th>
                <th className="py-3 px-4">Số món</th>
                <th className="py-3 px-4">Tổng tiền</th>
                <th className="py-3 px-4">Thanh toán</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    Chưa có đơn hàng nào phát sinh hôm nay
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => {
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

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        #{order.orderCode}
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        <div className="font-semibold">{order.userName}</div>
                        <div className="text-[10px] text-slate-400">{order.userPhone}</div>
                      </td>
                      <td className="py-3 px-4">{methodBadge}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {order.orderType === 'DINE_IN' && (
                          <span className="font-semibold text-slate-200">{order.tableNumber || 'Bàn 01'}</span>
                        )}
                        {order.orderType === 'TAKEAWAY' && (
                          <span className="font-mono text-emerald-400 font-bold">
                            {order.pickupCode || order.pickupSlot || 'Ca trưa'}
                          </span>
                        )}
                        {order.orderType === 'DELIVERY' && (
                          <span className="text-[11px] text-slate-300 truncate max-w-[140px] block">
                            {order.deliveryAddressText || 'KTX A1'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {order.orderDetails?.length || 1} món
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-100">
                        {order.finalAmount?.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-3 px-4">
                        {order.isPaid ? (
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Chờ thanh toán
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {order.elapsedMinutes !== undefined
                          ? order.elapsedMinutes === 0
                            ? 'Vừa đặt'
                            : `${order.elapsedMinutes} phút trước`
                          : 'Hôm nay'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderId(order.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors"
                          title="Xem chi tiết đơn"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <StaffOrderDetailModal
          orderId={selectedOrderId}
          isOpen={true}
          onClose={() => {
            setSelectedOrderId(null);
            fetchDashboardData();
          }}
          onUpdated={() => {
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};
