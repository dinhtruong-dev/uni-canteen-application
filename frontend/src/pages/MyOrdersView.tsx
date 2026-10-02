import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Search,
} from 'lucide-react';
import { Order } from '../types';

export const MyOrdersView: React.FC = () => {
  const { orders, navigateTo, addToCart, showToast } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const categories = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'FOOD', label: 'Đồ ăn' },
    { id: 'DELIVERY', label: 'Giao hàng' },
    { id: 'DINE_IN', label: 'Ăn tại chỗ' },
    { id: 'PROCESSING', label: 'Đang xử lý' },
    { id: 'COMPLETED', label: 'Hoàn thành' },
  ];

  const filteredOrders = orders.filter((o) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrderNum = o.orderNumber.toLowerCase().includes(q);
      const matchCanteen = o.canteenName.toLowerCase().includes(q);
      const matchFood = o.items.some((it) => it.food?.name.toLowerCase().includes(q));
      if (!matchOrderNum && !matchCanteen && !matchFood) {
        return false;
      }
    }

    if (activeCategory === 'FOOD') {
      return o.items && o.items.length > 0;
    }
    if (activeCategory === 'DELIVERY') {
      return o.orderType === 'DELIVERY';
    }
    if (activeCategory === 'DINE_IN') {
      return o.orderType === 'DINE_IN';
    }
    if (activeCategory === 'PROCESSING') {
      return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING'].includes(o.status);
    }
    if (activeCategory === 'COMPLETED') {
      return ['COMPLETED', 'SERVED'].includes(o.status);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: 'bg-[#e6f8f7] text-[#00897b]',
          text: 'Hoàn thành',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-slate-100 text-slate-600',
          text: 'Đã hủy',
        };
      case 'READY':
        return {
          bg: 'bg-[#ccfbf1] text-[#0f766e]',
          text: 'Mời nhận món',
        };
      case 'DELIVERING':
        return {
          bg: 'bg-[#e0f2fe] text-[#0284c7]',
          text: 'Đang giao',
        };
      case 'PREPARING':
        return {
          bg: 'bg-[#fef3c7] text-[#d97706]',
          text: 'Đang nấu',
        };
      case 'PENDING':
        return {
          bg: 'bg-orange-50 text-orange-700',
          text: 'Chờ xác nhận',
        };
      case 'CONFIRMED':
        return {
          bg: 'bg-indigo-50 text-indigo-700',
          text: 'Đã nhận đơn',
        };
      case 'SERVED':
        return {
          bg: 'bg-[#e6f8f7] text-[#00897b]',
          text: 'Đã phục vụ',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700',
          text: status,
        };
    }
  };

  const handleReorder = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    if (!order.items || order.items.length === 0) return;

    let addedCount = 0;
    order.items.forEach((item) => {
      if (item.food) {
        addToCart(
          item.food,
          item.quantity || 1,
          item.selectedSize,
          item.selectedToppings || [],
          item.notes || ''
        );
        addedCount += item.quantity || 1;
      }
    });

    showToast(`Đã thêm ${addedCount} món vào giỏ hàng!`, 'success');
    navigateTo('cart');
  };

  const handleTracking = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    navigateTo('order-detail', { orderId: order.id });
  };

  const parseOrderDateHeader = (rawDate: string | undefined): string => {
    if (!rawDate) return '02 thg 9 2026';
    const vnMatch = rawDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (vnMatch) {
      const [, d, m, y] = vnMatch;
      return `${d.padStart(2, '0')} thg ${parseInt(m, 10)} ${y}`;
    }
    const ymdMatch = rawDate.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      const [, y, m, d] = ymdMatch;
      return `${d.padStart(2, '0')} thg ${parseInt(m, 10)} ${y}`;
    }
    return '02 thg 9 2026';
  };

  const parseOrderTimeDisplay = (rawDate: string | undefined): string => {
    if (!rawDate) return '';
    const timeMatch = rawDate.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const [, h, m] = timeMatch;
      const hour = parseInt(h, 10);
      const suffix = hour >= 12 ? 'CH' : 'SA';
      const displayH = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${String(displayH).padStart(2, '0')}:${m} ${suffix}`;
    }
    return '';
  };

  // Group orders by date header
  const groupedOrders = filteredOrders.reduce<Record<string, Order[]>>((acc, order) => {
    const header = parseOrderDateHeader(order.createdAt);
    if (!acc[header]) {
      acc[header] = [];
    }
    acc[header].push(order);
    return acc;
  }, {});

  return (
    <div className="-mt-1 sm:-mt-2 space-y-3 pb-24 max-w-xl mx-auto px-1 sm:px-0">
      {/* Sticky Header Container (Title + Search + Category Tabs stay fixed on scroll giống bên Thông báo) */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-slate-200/60 transition-all space-y-2">
        {/* Top Header: Tiêu đề Hoạt động + Nút tìm kiếm */}
        <div className="flex items-center justify-between">
          <h1
            id="activity-page-title"
            className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight"
          >
            Hoạt động
          </h1>

          {/* Nút tìm kiếm tròn góc phải */}
          <button
            id="toggle-search-btn"
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer"
            aria-label="Tìm kiếm hoạt động"
            title="Tìm kiếm hoạt động"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh tìm kiếm hiển thị khi mở */}
        {(showSearch || searchQuery) && (
          <div className="relative w-full">
            <input
              id="search-orders-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo món ăn, căng tin, mã đơn..."
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-800 shadow-2xs"
              autoFocus
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Filter Pills (Di chuyển, Đồ ăn, Giao hàng...) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`category-pill-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2f323a] text-white shadow-xs'
                    : 'bg-[#f3f4f6] text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Order List grouped by Date */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-3 mt-4">
          <div className="w-14 h-14 rounded-2xl bg-[#e6f8f7] text-[#00897b] flex items-center justify-center mx-auto border border-[#b2ebe7]">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-sm">Chưa có hoạt động nào</h3>
            <p className="text-xs text-slate-500">
              {searchQuery.trim()
                ? 'Không tìm thấy hoạt động phù hợp với từ khóa.'
                : 'Bạn chưa có hoạt động nào trong mục này.'}
            </p>
          </div>
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#2b2f33] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Khám phá thực đơn ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedOrders).map(([dateHeader, groupOrders]) => (
            <div key={dateHeader} className="space-y-2.5">
              {/* Date Header: "02 thg 9 2026" (chuẩn như ảnh) */}
              <h2 className="text-xs sm:text-sm font-semibold text-slate-400 px-1 mt-3">
                {dateHeader}
              </h2>

              {(groupOrders as Order[]).map((order) => {
                const badge = getStatusBadge(order.status);
                const mainItem = order.items[0];
                const mainFood = mainItem?.food;
                const remainingItemTypes = Math.max(0, order.items.length - 1);
                const timeDisplay = parseOrderTimeDisplay(order.createdAt);
                const thumbnailImage =
                  mainFood?.image ||
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300';

                return (
                  <div
                    key={order.id}
                    id={`order-card-${order.id}`}
                    onClick={() => navigateTo('order-detail', { orderId: order.id })}
                    className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer space-y-2"
                    title="Bấm để xem chi tiết hoạt động"
                  >
                    {/* Dòng 1: Tên Căng tin - Giờ | Badge trạng thái */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-500 truncate">
                        {order.canteenName} {timeDisplay ? `- ${timeDisplay}` : ''}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${badge.bg}`}
                      >
                        {badge.text}
                      </span>
                    </div>

                    {/* Dòng 2: Tuyến nhận/giao món + Ảnh thumbnail tròn bên phải */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1 text-xs flex-1 min-w-0">
                        {/* Điểm xuất phát (Căng tin) */}
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <span className="w-3 h-3 rounded-full border-2 border-slate-400 shrink-0" />
                          <span className="truncate font-medium">{order.canteenName}</span>
                        </div>

                        {/* Điểm nhận / Bàn / Phòng KTX */}
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <span className="w-2.5 h-2.5 rounded-xs bg-slate-500 shrink-0" />
                          <span className="truncate font-medium">
                            {order.orderType === 'DINE_IN'
                              ? `Bàn: ${order.tableInfo?.tableName || 'Tại chỗ'}`
                              : order.orderType === 'DELIVERY'
                              ? `Giao KTX: ${order.deliveryAddress?.building || 'KTX'} - ${order.deliveryAddress?.room || ''}`
                              : `Nhận tại quầy: ${order.pickupTimeSlot || 'Quầy số 1'}`}
                          </span>
                        </div>

                        {/* Danh sách món ăn */}
                        <p className="text-[11px] text-slate-500 line-clamp-1 pl-4.5">
                          {mainItem ? `${mainItem.quantity}x ${mainFood?.name || 'Món ăn'}` : 'Đơn hàng'}
                          {remainingItemTypes > 0 && ` (và ${remainingItemTypes} món khác)`}
                        </p>
                      </div>

                      {/* Ảnh tròn thumbnail bên phải (như icon xe trong ảnh mẫu) */}
                      <div className="w-10 h-10 rounded-full bg-[#dff7f5] overflow-hidden border border-[#b2ebe7] shrink-0 flex items-center justify-center shadow-2xs">
                        <img
                          src={thumbnailImage}
                          alt={mainFood?.name || 'Món ăn'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300';
                          }}
                        />
                      </div>
                    </div>

                    {/* Dòng 3: Giá tiền bên trái | Nút Đặt lại / Theo dõi bên phải */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </span>

                      <div className="flex items-center gap-1.5">
                        {['COMPLETED', 'SERVED', 'CANCELLED'].includes(order.status) && (
                          <button
                            id={`reorder-btn-${order.id}`}
                            onClick={(e) => handleReorder(e, order)}
                            className="border border-slate-300 text-slate-800 hover:bg-slate-50 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer shadow-2xs active:scale-95"
                          >
                            Đặt lại
                          </button>
                        )}

                        {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING'].includes(
                          order.status
                        ) && (
                          <button
                            id={`track-btn-${order.id}`}
                            onClick={(e) => handleTracking(e, order)}
                            className="bg-[#2b2f33] hover:bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer shadow-2xs active:scale-95"
                          >
                            Theo dõi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


