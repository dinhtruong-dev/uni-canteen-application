import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Trash2,
  Utensils,
  Star,
  ShoppingBag as BagIcon,
  CheckSquare,
  Square,
} from 'lucide-react';

// 3D Turquoise Shopping Basket with Yellow Handle (trùng khớp ảnh mẫu)
const EmptyCartBasket: React.FC = () => (
  <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
    <svg
      viewBox="0 0 240 220"
      className="w-full h-full drop-shadow-[0_12px_24px_rgba(6,182,212,0.22)]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients cho quai xách màu vàng */}
        <linearGradient id="handle-grad-light" x1="80" y1="50" x2="160" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="handle-side-shade" x1="80" y1="50" x2="80" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Gradients cho thân giỏ hàng ngọc lam / cyan */}
        <linearGradient id="rim-top-grad" x1="45" y1="70" x2="195" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="side-left-grad" x1="45" y1="95" x2="118" y2="185" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="side-right-grad" x1="118" y1="95" x2="200" y2="165" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="floor-inside-grad" x1="60" y1="80" x2="175" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#155e75" />
        </linearGradient>
      </defs>

      {/* Bóng đổ tiếp xúc mặt sàn mềm mại */}
      <ellipse cx="120" cy="186" rx="68" ry="16" fill="#0e7490" fillOpacity="0.14" filter="blur(6px)" />

      {/* Quai xách màu vàng - Cung vòm nghiêng ra sau */}
      <path
        d="M 102 56 L 140 73 L 146 78 L 146 96 L 138 96 L 138 82 L 104 66 L 78 79 L 78 96 L 70 96 L 70 75 Z"
        fill="url(#handle-grad-light)"
      />
      {/* Độ dày cạnh trong quai vàng */}
      <path
        d="M 102 56 L 102 63 L 78 79 L 70 75 Z"
        fill="#fef08a"
      />
      <path
        d="M 102 56 L 140 73 L 140 80 L 102 63 Z"
        fill="url(#handle-side-shade)"
      />

      {/* Đáy trong lòng giỏ hàng */}
      <polygon
        points="65,96 126,74 186,96 126,126"
        fill="url(#floor-inside-grad)"
      />

      {/* Nan sọc trắng nghiêng ở lòng đáy (như trong ảnh mẫu) */}
      <g stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" opacity="0.9">
        <line x1="88" y1="107" x2="98" y2="92" />
        <line x1="97" y1="112" x2="107" y2="97" />
        <line x1="106" y1="117" x2="116" y2="102" />
        <line x1="115" y1="121" x2="125" y2="106" />
        <line x1="124" y1="117" x2="134" y2="102" />
        <line x1="133" y1="112" x2="143" y2="97" />
        <line x1="142" y1="107" x2="152" y2="92" />
      </g>

      {/* Mặt ngoài bên trái của giỏ */}
      <polygon
        points="46,102 118,135 106,178 44,138"
        fill="url(#side-left-grad)"
      />

      {/* Mặt ngoài bên phải của giỏ */}
      <polygon
        points="118,135 196,98 181,141 106,178"
        fill="url(#side-right-grad)"
      />

      {/* Khe thoát khí nan dọc mặt trái */}
      <g fill="#0e7490" opacity="0.65">
        <rect x="52" y="115" width="3.2" height="17" rx="1.6" transform="skewY(16)" />
        <rect x="62" y="119" width="3.2" height="18" rx="1.6" transform="skewY(16)" />
        <rect x="72" y="123" width="3.2" height="19" rx="1.6" transform="skewY(16)" />
        <rect x="82" y="127" width="3.2" height="20" rx="1.6" transform="skewY(16)" />
        <rect x="92" y="131" width="3.2" height="21" rx="1.6" transform="skewY(16)" />
      </g>

      {/* Khe thoát khí nan dọc mặt phải */}
      <g fill="#155e75" opacity="0.65">
        <rect x="124" y="173" width="3.2" height="20" rx="1.6" transform="skewY(-16)" />
        <rect x="134" y="168" width="3.2" height="19" rx="1.6" transform="skewY(-16)" />
        <rect x="144" y="163" width="3.2" height="18" rx="1.6" transform="skewY(-16)" />
        <rect x="154" y="158" width="3.2" height="17" rx="1.6" transform="skewY(-16)" />
        <rect x="164" y="153" width="3.2" height="16" rx="1.6" transform="skewY(-16)" />
      </g>

      {/* Vành bo trên dày 3D */}
      <polygon
        points="44,101 118,135 196,97 125,69"
        fill="none"
        stroke="url(#rim-top-grad)"
        strokeWidth="8.5"
        strokeLinejoin="round"
      />
      {/* Đường viền sáng bóng phía mép vành */}
      <polygon
        points="51,99 118,129 189,96 125,73"
        fill="none"
        stroke="#a5f3fc"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* Khớp bản lề tròn gắn quai vàng */}
      <circle cx="118" cy="133" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.6" />
      <circle cx="125" cy="71" r="4.5" fill="#d97706" />
    </svg>
  </div>
);

export const CartView: React.FC = () => {
  const { cart, removeFromCart, navigateTo, showToast, currentUser } = useApp();

  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isAllSelected = cart.length > 0 && selectedIds.length === cart.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map((item) => item.id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    selectedIds.forEach((id) => removeFromCart(id));
    setSelectedIds([]);
    setIsManageMode(false);
    showToast(`Đã xóa ${count} món khỏi giỏ hàng!`, 'info');
  };

  const toggleManageMode = () => {
    if (isManageMode) {
      setIsManageMode(false);
      setSelectedIds([]);
    } else {
      setIsManageMode(true);
    }
  };

  // Màn hình khi giỏ hàng trống (Thiết kế chính xác theo ảnh đính kèm)
  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-[85vh] flex flex-col max-w-xl mx-auto px-4 sm:px-6 py-2">
        {/* Nút X đóng giỏ hàng ở góc trên bên trái */}
        <div className="flex items-center pt-2">
          <button
            id="close-cart-btn"
            onClick={() => navigateTo('home')}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng giỏ hàng"
            title="Đóng giỏ hàng"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>
        </div>

        {/* Dòng tiêu đề: Quản lý (bên trái) và Quản lý (bên phải màu xám nhạt) */}
        <div className="flex items-center justify-between mt-2 mb-2">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Quản lý
          </h1>
          <span className="text-xs sm:text-sm font-medium text-slate-400 select-none">
            Quản lý
          </span>
        </div>

        {/* Khối giữa màn hình: Giỏ hàng 3D, Tiêu đề và Mô tả */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-16 sm:-mt-20 text-center px-4">
          <EmptyCartBasket />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-7 tracking-tight">
            Giỏ hàng đang trống!
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1.5 leading-relaxed max-w-xs">
            Thêm món vào giỏ để bắt đầu đặt hàng.
          </p>
        </div>
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập để tiến hành đặt món và thanh toán!', 'info');
      navigateTo('login', { next: 'checkout' });
      return;
    }
    navigateTo('checkout');
  };

  // Màn hình khi giỏ hàng có món
  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-4 sm:px-6 py-2">
      {/* Nút X đóng giỏ hàng ở góc trên bên trái */}
      <div className="flex items-center pt-2">
        <button
          id="close-cart-btn"
          onClick={() => navigateTo('home')}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Đóng giỏ hàng"
          title="Đóng giỏ hàng"
        >
          <X className="w-6 h-6 stroke-[2]" />
        </button>
      </div>

      {/* Dòng tiêu đề: Quản lý (bên trái) và Nút Quản lý / Hủy (bên phải) */}
      <div className="flex items-center justify-between mt-2 pb-2 border-b border-slate-100">
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Quản lý</h1>

        <button
          id="toggle-manage-btn"
          type="button"
          onClick={toggleManageMode}
          className={`text-xs sm:text-sm font-bold cursor-pointer px-3 py-1 rounded-lg transition-colors ${
            isManageMode ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {isManageMode ? 'Hủy' : 'Quản lý'}
        </button>
      </div>

      {/* Danh sách món ăn trong giỏ hàng */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100">
        {cart.map((item) => (
          <div
            key={item.id}
            className="p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/80 transition-colors group cursor-pointer"
            onClick={() => {
              if (isManageMode) {
                if (selectedIds.includes(item.id)) {
                  setSelectedIds(selectedIds.filter((id) => id !== item.id));
                } else {
                  setSelectedIds([...selectedIds, item.id]);
                }
              } else {
                navigateTo('checkout');
              }
            }}
          >
            {/* Ảnh món ăn */}
            <img
              src={item.food.image}
              alt={item.food.name}
              className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-200/60"
            />

            {/* Tên món + Căng tin + Đánh giá */}
            <div className="flex-1 min-w-0 pr-1">
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-cyan-600 transition-colors">
                {item.food.canteenName ? `${item.food.canteenName} - ${item.food.name}` : item.food.name}
              </h3>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-0.5 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" /> {item.food.rating || 4.9} ({item.food.reviewCount || 39})
                </span>

                <span className="flex items-center gap-0.5 font-medium text-slate-500">
                  <BagIcon className="w-3 h-3 text-cyan-600" /> {item.food.orderCount || '1.9K+'}
                </span>
              </div>
            </div>

            {/* Giá tiền & Số lượng */}
            <div className="text-right shrink-0 flex flex-col items-end justify-center">
              <span className="font-black text-slate-900 text-xs sm:text-sm">
                {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
              </span>
              <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {item.quantity} món
              </span>
            </div>

            {/* Checkbox nằm phía BÊN PHẢI khi ở chế độ Quản lý */}
            {isManageMode && (
              <div
                className="shrink-0 text-orange-600 pl-1 cursor-pointer"
                onClick={(e) => toggleSelect(item.id, e)}
              >
                {selectedIds.includes(item.id) ? (
                  <CheckSquare className="w-5 h-5 text-orange-600 fill-orange-50" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottombar khi ở chế độ Quản lý: Chọn tất cả (bên trái) và Xóa (bên phải) */}
      {isManageMode && (
        <div
          id="cart-manage-bottom-bar"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 sm:px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="max-w-xl mx-auto flex items-center justify-between">
            {/* Chữ & Checkbox Chọn tất cả */}
            <button
              id="select-all-cart-btn"
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 hover:text-slate-950 transition-colors cursor-pointer select-none"
            >
              {isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-orange-600 shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <span>Chọn tất cả</span>
              <span className="text-xs text-slate-400 font-medium">
                ({selectedIds.length}/{cart.length})
              </span>
            </button>

            {/* Nút Xóa */}
            <button
              id="batch-delete-btn"
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleBatchDelete}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                selectedIds.length > 0
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-sm shadow-rose-600/25 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa</span>
              {selectedIds.length > 0 && <span>({selectedIds.length})</span>}
            </button>
          </div>
        </div>
      )}

      {/* Bottombar khi ở chế độ bình thường (Đặt hàng) */}
      {!isManageMode && cart.length > 0 && (
        <div
          id="cart-checkout-bottom-bar"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 sm:px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        >
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Tổng thanh toán:</span>
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toLocaleString('vi-VN')}đ
              </span>
            </div>

            <button
              id="cart-proceed-checkout-btn"
              type="button"
              onClick={handleProceedToCheckout}
              className="bg-[#2b2f33] hover:bg-slate-900 active:scale-95 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              Đặt hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

