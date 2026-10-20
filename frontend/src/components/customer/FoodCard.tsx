import React from 'react';
import { FoodItem } from '../../types';
import { Star, Clock, ShoppingBag, BadgeCheck, Ticket, Package } from 'lucide-react';

interface FoodCardProps {
  food: FoodItem;
  onSelectFood: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onSelectFood }) => {
  // Tính toán nhãn voucher giảm giá theo phong cách ShopeeFood (40k, 30%, 60k...)
  const getVoucherTag = () => {
    if (food.originalPrice && food.originalPrice > food.price) {
      const pct = Math.round((1 - food.price / food.originalPrice) * 100);
      return `${pct}%`;
    }
    const vouchers = ['40k', '30%', '25k', '50k', '20%', '60k'];
    const charCodeSum = food.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return vouchers[charCodeSum % vouchers.length];
  };

  const voucherText = getVoucherTag();
  const reviewCount = food.reviewCount || ((food.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40) + 12);
  const soldCountText = food.soldCount
    ? `${food.soldCount}+`
    : (food.rating >= 4.8 ? '1.2K+' : (food.rating >= 4.5 ? '1K+' : '300+'));

  return (
    <div
      onClick={() => onSelectFood(food)}
      className="bg-transparent group flex flex-col h-full cursor-pointer select-none transition-all w-full"
    >
      {/* 1. Image Container - Bo góc mềm mại như app giao hàng */}
      <div className="relative aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden border border-[#E9DDE3] shadow-2xs group-hover:shadow-md group-hover:border-[#FF4F8B] transition-all">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10 pointer-events-none">
          {food.isNew && (
            <span className="bg-[#22C55E] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs">
              Món mới
            </span>
          )}
          {!food.isAvailable && (
            <span className="bg-slate-900/90 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs">
              Hết
            </span>
          )}
        </div>

        {/* Prep Time Badge */}
        <div className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" /> {food.preparationTime}p
        </div>
      </div>

      {/* 2. Card Body theo chuẩn giao diện mẫu ShopeeFood */}
      <div className="pt-2 px-0.5 flex-1 flex flex-col justify-between gap-1">
        {/* Tên Quán / Món kèm dấu tích xanh Verified */}
        <div className="space-y-1">
          <div className="flex items-start gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-[#00BFA5] fill-[#00BFA5] text-white shrink-0 mt-0.5" />
            <h3 className="font-bold text-[#1F2937] text-xs sm:text-[13px] group-hover:text-[#FF4F8B] transition-colors line-clamp-2 leading-snug">
              {food.canteenName ? `${food.canteenName} - ` : ''}{food.name}
            </h3>
          </div>

          {/* Hàng Đánh giá ⭐ 4.6 (36) và Lượt bán 🛍️ 1K+ */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium">
            <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{food.rating}</span>
              <span className="text-[#94A3B8] font-normal text-[9.5px]">({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-[#64748B] shrink-0">
              <ShoppingBag className="w-3 h-3 text-[#FF5722]" />
              <span className="text-[#64748B] text-[10px] font-medium">{soldCountText}</span>
            </div>
          </div>
        </div>

        {/* 3. Hàng Voucher kích thích người mua: [🎫 40k] [📦 Freeship] */}
        <div className="pt-1 mt-auto flex items-center gap-1 flex-wrap">
          <span className="inline-flex items-center gap-0.5 text-[9.5px] sm:text-[10px] font-bold text-[#FF5722] bg-[#FFF5F2] border border-[#FF5722]/30 px-1.5 py-0.5 rounded leading-tight">
            <Ticket className="w-2.5 h-2.5 text-[#FF5722] shrink-0" />
            <span>{voucherText}</span>
          </span>
          <span className="inline-flex items-center gap-0.5 text-[9.5px] sm:text-[10px] font-bold text-[#009688] bg-[#E0F7F4] border border-[#00BFA5]/30 px-1.5 py-0.5 rounded leading-tight">
            <Package className="w-2.5 h-2.5 text-[#00BFA5] shrink-0" />
            <span>Freeship</span>
          </span>
        </div>
      </div>
    </div>
  );
};
