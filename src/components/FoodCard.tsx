import React from 'react';
import { FoodItem } from '../types';
import { useApp } from '../context/AppContext';
import { Star, Plus, Heart, Clock, Flame, Leaf, ShoppingBag } from 'lucide-react';

interface FoodCardProps {
  food: FoodItem;
  onSelectFood: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onSelectFood }) => {
  const { toggleFavorite, isFavorite, addToCart } = useApp();
  const favorite = isFavorite(food.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!food.isAvailable) return;

    // If item has sizes or toppings, open detail modal for customization
    if ((food.sizes && food.sizes.length > 0) || (food.toppings && food.toppings.length > 0)) {
      onSelectFood(food);
    } else {
      addToCart(food, 1);
    }
  };

  return (
    <div
      onClick={() => onSelectFood(food)}
      className="bg-transparent group flex flex-col h-full cursor-pointer select-none transition-all w-full"
    >
      {/* Image Container - Only Image has rounded 4 corners & border */}
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

      {/* Details below - No card background, clean text layout */}
      <div className="pt-2 px-0.5 flex-1 flex flex-col justify-between gap-1">
        <div>
          <h3 className="font-normal text-[#1F2937] text-xs sm:text-sm group-hover:text-[#FF4F8B] transition-colors line-clamp-1 leading-tight">
            {food.name}
          </h3>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#64748B] font-medium mt-0.5">
            <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-current" />
              <span>{food.rating}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-0.5 text-[#94A3B8] font-normal truncate">
              <ShoppingBag className="w-3 h-3 text-[#94A3B8] shrink-0" />
              <span>{food.soldCount ? `${food.soldCount}+` : (food.reviewCount > 100 ? '1K+' : '500+')}</span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-1 flex items-center justify-between mt-auto">
          <div>
            <div className="text-sm sm:text-base font-bold text-[#FF4F8B]">
              {food.price.toLocaleString('vi-VN')}đ
            </div>
            {food.originalPrice && (
              <div className="text-[10px] text-[#94A3B8] line-through -mt-0.5 font-medium">
                {food.originalPrice.toLocaleString('vi-VN')}đ
              </div>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!food.isAvailable}
            className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border shrink-0 ${
              !food.isAvailable
                ? 'bg-slate-100 text-[#94A3B8] border-[#E9DDE3] cursor-not-allowed'
                : 'bg-[#FFF3F7] hover:bg-[#FFE4EE] text-[#FF4F8B] border-[#FFE4EE] shadow-2xs active:scale-95'
            }`}
            title="Thêm món"
            aria-label="Thêm món"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
