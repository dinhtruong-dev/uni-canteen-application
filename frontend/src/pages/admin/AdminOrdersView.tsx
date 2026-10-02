import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Store,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Truck,
  QrCode,
  ShoppingBag,
  Download,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Order, OrderStatus, OrderType, PaymentStatus } from '../../types';
import { AdminOrderDetailModal } from './AdminOrderDetailModal';

export const AdminOrdersView: React.FC = () => {
  const { orders, canteens, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [canteenFilter, setCanteenFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | OrderType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.userPhone && o.userPhone.includes(searchTerm));

    const matchCanteen = canteenFilter === 'ALL' || o.canteenId === canteenFilter;
    const matchType = typeFilter === 'ALL' || o.orderType === typeFilter;
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchPayment =
      paymentStatusFilter === 'ALL' || o.paymentStatus === paymentStatusFilter;

    return matchSearch && matchCanteen && matchType && matchStatus && matchPayment;
  });

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Chờ duyệt</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Đã duyệt (Bếp)</span>;
      case 'PREPARING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">Bếp đang nấu</span>;
      case 'READY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Sẵn sàng nhận</span>;
      case 'DELIVERING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Đang giao KTX</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Đã hủy</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-purple-400" />
              Tra Cứu & Quản Lý Đơn Hàng Toàn Hệ Thống
            </h2>
            <p className="text-xs text-slate-400">
              Giám sát tình trạng thực hiện đơn hàng, can thiệp trạng thái, kiểm tra thanh toán trên toàn bộ các căn tin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
              Tổng số: {filteredOrders.length} đơn
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-800">
          <div className="relative lg:col-span-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mã đơn, tên, SĐT..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <select
            value={canteenFilter}
            onChange={(e) => setCanteenFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả Căn tin ({canteens.length})</option>
            {canteens.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả hình thức</option>
            <option value="DINE_IN">Ăn tại bàn (QR)</option>
            <option value="PICKUP">Nhận tại quầy (Pickup)</option>
            <option value="DELIVERY">Giao tận phòng KTX</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái đơn</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="CONFIRMED">Đã duyệt (Bếp)</option>
            <option value="PREPARING">Bếp đang nấu</option>
            <option value="READY">Sẵn sàng nhận</option>
            <option value="DELIVERING">Đang giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả thanh toán</option>
            <option value="PAID">Đã thanh toán (PAID)</option>
            <option value="UNPAID">Chưa thanh toán (UNPAID)</option>
          </select>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Mã đơn</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Căn tin</th>
                <th className="py-3.5 px-4">Hình thức nhận</th>
                <th className="py-3.5 px-4">Số món</th>
                <th className="py-3.5 px-4">Tổng tiền</th>
                <th className="py-3.5 px-4">Thanh toán</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày đặt</th>
                <th className="py-3.5 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-purple-400">
                      {o.orderNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-100">{o.userName}</p>
                      <p className="text-[10px] text-slate-400">{o.userPhone || '0987 654 321'}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{o.canteenName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-slate-300">
                        {o.orderType === 'DINE_IN' && <QrCode className="w-3 h-3 text-purple-400" />}
                        {o.orderType === 'PICKUP' && <ShoppingBag className="w-3 h-3 text-blue-400" />}
                        {o.orderType === 'DELIVERY' && <Truck className="w-3 h-3 text-emerald-400" />}
                        {o.orderType === 'DINE_IN'
                          ? 'Tại bàn'
                          : o.orderType === 'PICKUP'
                          ? 'Nhận quầy'
                          : 'Giao KTX'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                      {o.items.length} món
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm">
                      {o.totalAmount.toLocaleString('vi-VN')}đ
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {o.paymentStatus === 'PAID' ? 'ĐÃ TRẢ' : 'CHƯA TRẢ'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(o.status)}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-400 font-mono">
                      {o.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(o)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Order Detail Modal */}
      <AdminOrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
