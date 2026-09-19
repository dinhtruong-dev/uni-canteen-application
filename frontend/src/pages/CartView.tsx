import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Trash2,
  ChevronLeft,
  Utensils,
  Star,
  ShoppingBag as BagIcon,
  CheckSquare,
  Square,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const { cart, removeFromCart, navigateTo } = useApp();

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

  const handleBatchDelete = () => {
    selectedIds.forEach((id) => removeFromCart(id));
    setSelectedIds([]);
    setIsManageMode(false);
  };

  const toggleManageMode = () => {
    if (isManageMode) {
      setIsManageMode(false);
      setSelectedIds([]);
    } else {
      setIsManageMode(true);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto my-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Hãy dạo quanh thực đơn và chọn cho mình những món ăn thơm ngon, nóng hổi ngay nhé!
        </p>
        <button
          onClick={() => navigateTo('menu')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-orange-500/20 inline-flex items-center gap-2 cursor-pointer"
        >
          <Utensils className="w-4 h-4" /> Khám phá món ăn ngay
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16 max-w-4xl mx-auto">
      {/* Top Header - Exact replica of screenshot with Manage/Cancel toggle */}
      <div className="flex items-center justify-between py-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('home')}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-slate-800"
            aria-label="Quay lại"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Quản lý</h1>
        </div>

        <div className="flex items-center gap-2">
          {isManageMode && selectedIds.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={toggleManageMode}
            className={`text-xs font-bold cursor-pointer px-2.5 py-1 rounded-md transition-colors ${
              isManageMode ? 'text-rose-600 bg-rose-50' : 'text-cyan-600 hover:text-cyan-700'
            }`}
          >
            {isManageMode ? 'Hủy' : 'Quản lý'}
          </button>
        </div>
      </div>

      {/* Cart Items List - Clean List matching Screenshot */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100">
        {cart.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/80 transition-colors group cursor-pointer"
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
            {/* Checkbox when in Manage Mode */}
            {isManageMode && (
              <div
                className="shrink-0 text-orange-600 pr-1 cursor-pointer"
                onClick={(e) => toggleSelect(item.id, e)}
              >
                {selectedIds.includes(item.id) ? (
                  <CheckSquare className="w-5 h-5 text-orange-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                )}
              </div>
            )}

            {/* Left: Food/Canteen Avatar */}
            <img
              src={item.food.image}
              alt={item.food.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-200/60"
            />

            {/* Center: Food / Store Title + Ratings + Sold Count + Location */}
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                {item.food.canteenName ? `${item.food.canteenName} - ${item.food.name}` : item.food.name}
              </h3>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-0.5 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" /> {item.food.rating || 4.9} ({item.food.reviewCount || 39})
                </span>

                <span className="flex items-center gap-0.5 font-medium text-slate-500">
                  <BagIcon className="w-3 h-3 text-orange-500" /> {item.food.orderCount || '1.9K+'}
                </span>
              </div>
            </div>

            {/* Right: Price & Item Count Only */}
            <div className="text-right shrink-0 flex flex-col items-end justify-center">
              <span className="font-black text-slate-900 text-sm sm:text-base">
                {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-0.5">
                {item.quantity} món
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

