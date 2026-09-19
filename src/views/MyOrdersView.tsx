import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Search, ChevronRight, MapPin, Clock } from 'lucide-react';

export const MyOrdersView: React.FC = () => {
  const { orders, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((o) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (!o.orderNumber.toLowerCase().includes(q) && !o.canteenName.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (activeTab === 'PROCESSING') {
      return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'SERVED'].includes(o.status);
    }
    if (activeTab === 'COMPLETED') {
      return o.status === 'COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return o.status === 'CANCELLED';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', text: 'Hoàn thành' };
      case 'CANCELLED':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200/60', text: 'Đã hủy' };
      case 'READY':
        return { bg: 'bg-teal-50 text-teal-700 border-teal-200/60', text: 'Mời nhận món' };
      case 'DELIVERING':
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200/60', text: 'Đang giao' };
      case 'PREPARING':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', text: 'Đang nấu' };
      case 'PENDING':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200/60', text: 'Chờ nhận' };
      case 'SERVED':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200/60', text: 'Đã phục vụ' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200/60', text: status };
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Đơn Hàng Của Tôi</h1>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi lịch sử và tiến độ chuẩn bị món ăn</p>
        </div>

        {/* Search Order ID */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn (#CT...)..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold scrollbar-none">
        {[
          { id: 'ALL', label: 'Tất cả' },
          { id: 'PROCESSING', label: 'Đang xử lý' },
          { id: 'COMPLETED', label: 'Hoàn thành' },
          { id: 'CANCELLED', label: 'Đã hủy' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Không có đơn hàng nào</h3>
          <p className="text-xs text-slate-500">Bạn chưa có đơn hàng nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                onClick={() => navigateTo('order-detail', { orderId: order.id })}
                className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group space-y-2"
                title="Bấm để xem theo dõi đơn hàng"
              >
                {/* Row 1: Code + Mode + Status + Chevron */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm group-hover:text-orange-600 transition-colors shrink-0">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">•</span>
                    <span className="text-[10px] text-slate-500 font-medium truncate">
                      {order.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                      {badge.text}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Row 2: Canteen and Items list */}
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                    <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                    <span className="truncate">{order.canteenName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 text-[10px] font-medium shrink-0">
                      {order.orderType === 'DINE_IN'
                        ? '🍽️ Ăn tại chỗ'
                        : order.orderType === 'PICKUP'
                        ? '🏃 Nhận tại quầy'
                        : '🏠 Giao KTX'}
                    </span>
                  </div>

                  <p className="line-clamp-1 text-[11px] text-slate-500 font-normal">
                    {order.items.map((it) => `${it.quantity}x ${it.food.name}`).join(', ')}
                  </p>
                </div>

                {/* Row 3: Total price and items count */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    {order.items.reduce((sum, it) => sum + it.quantity, 0)} món
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Tổng:</span>
                    <span className="font-bold text-sky-500 text-xs sm:text-sm">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
