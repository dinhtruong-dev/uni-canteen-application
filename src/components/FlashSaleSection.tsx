import React, { useState, useEffect } from 'react';
import { Flame, Clock, Plus, Heart, Star, Gift, Sparkles, ChevronRight, Zap, Tag } from 'lucide-react';
import { FoodItem } from '../types';
import { useApp } from '../context/AppContext';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';

interface FlashSaleItem {
  food: FoodItem;
  flashPrice: number;
  originalPrice: number;
  soldCount: number;
  totalStock: number;
  badge: string; // e.g. "GIẢM 40%" or "MUA 1 TẶNG 1"
}

interface FlashSaleSectionProps {
  onSelectFood: (food: FoodItem) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({ onSelectFood }) => {
  const { foods, addToCart, toggleFavorite, isFavorite, navigateTo } = useApp();

  // Timer state: 2 hours 15 mins countdown
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 18,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 30, seconds: 0 }; // reset
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Map foods to flash sale deals
  const flashSaleDeals: FlashSaleItem[] = [
    {
      food: foods[0] || {
        id: 'food-1',
        name: 'Cơm Gà Chiên Mắm Tỏi',
        price: 35000,
        originalPrice: 45000,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600',
        rating: 4.9,
        reviewCount: 184,
        preparationTime: 10,
        isBestSeller: true,
        isAvailable: true,
      },
      flashPrice: 25000,
      originalPrice: 40000,
      soldCount: 17,
      totalStock: 20,
      badge: 'MUA 1 TẶNG 1',
    },
    {
      food: foods[1] || {
        id: 'food-2',
        name: 'Cơm Tấm Sườn Bì Chả',
        price: 38000,
        originalPrice: 45000,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
        rating: 4.8,
        reviewCount: 210,
        preparationTime: 12,
        isBestSeller: true,
        isAvailable: true,
      },
      flashPrice: 28000,
      originalPrice: 42000,
      soldCount: 14,
      totalStock: 15,
      badge: '-33%',
    },
    {
      food: foods[2] || {
        id: 'food-3',
        name: 'Phở Bò Tái Lăn Hà Nội',
        price: 35000,
        originalPrice: 42000,
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=600',
        rating: 4.9,
        reviewCount: 312,
        preparationTime: 8,
        isBestSeller: true,
        isAvailable: true,
      },
      flashPrice: 22000,
      originalPrice: 38000,
      soldCount: 19,
      totalStock: 20,
      badge: '-42%',
    },
    {
      food: foods[4] || {
        id: 'food-5',
        name: 'Trà Đào Cam Sả Khổng Lồ',
        price: 20000,
        originalPrice: 25000,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600',
        rating: 4.9,
        reviewCount: 420,
        preparationTime: 5,
        isBestSeller: true,
        isAvailable: true,
      },
      flashPrice: 12000,
      originalPrice: 22000,
      soldCount: 28,
      totalStock: 30,
      badge: '-45%',
    },
    {
      food: foods[3] || {
        id: 'food-4',
        name: 'Bún Chả Hà Nội Nướng Than',
        price: 35000,
        originalPrice: 40000,
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600',
        rating: 4.8,
        reviewCount: 190,
        preparationTime: 10,
        isAvailable: true,
      },
      flashPrice: 26000,
      originalPrice: 38000,
      soldCount: 11,
      totalStock: 15,
      badge: 'MUA 1 TẶNG 1',
    },
    {
      food: foods[5] || {
        id: 'food-6',
        name: 'Bánh Mì Thập Cẩm Đặc Biệt',
        price: 20000,
        originalPrice: 25000,
        image: 'https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&q=80&w=600',
        rating: 4.7,
        reviewCount: 150,
        preparationTime: 5,
        isAvailable: true,
      },
      flashPrice: 14000,
      originalPrice: 22000,
      soldCount: 22,
      totalStock: 25,
      badge: '-36%',
    },
  ];

  const formatTime = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <section className="space-y-3 bg-transparent">
      {/* Flash Sale Header with Live Timer and Brand Colors */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF3F7] border border-[#FFE4EE] flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-[#FF4F8B] fill-[#FF4F8B] animate-pulse" />
          </div>
          <h2 className="text-sm sm:text-base font-black text-[#1F2937] flex items-center gap-1.5">
            FLASH SALE GIỜ VÀNG
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#FF4F8B] text-white">
              HOT
            </span>
          </h2>
        </div>

        {/* Live Countdown Timer & See All Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937]">
            <span className="text-[11px] text-[#64748B] font-semibold hidden sm:inline">Kết thúc trong:</span>
            <div className="flex items-center gap-1">
              <span className="bg-[#1F2937] text-white px-1.5 py-0.5 rounded-md font-mono text-xs shadow-2xs">
                {formatTime(timeLeft.hours)}
              </span>
              <span className="text-[#1F2937] font-bold">:</span>
              <span className="bg-[#1F2937] text-white px-1.5 py-0.5 rounded-md font-mono text-xs shadow-2xs">
                {formatTime(timeLeft.minutes)}
              </span>
              <span className="text-[#1F2937] font-bold">:</span>
              <span className="bg-[#FF4F8B] text-white px-1.5 py-0.5 rounded-md font-mono text-xs shadow-2xs animate-pulse">
                {formatTime(timeLeft.seconds)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigateTo('section-list', { filterType: 'FLASH_SALE', title: 'Flash Sale Giờ Vàng' })}
            className="flex items-center gap-0.5 text-xs font-bold text-[#FF4F8B] hover:text-[#E83E78] transition-colors cursor-pointer group"
            title="Xem tất cả món Flash Sale"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4 text-[#FF4F8B] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* 1-Row Horizontal Scrollable Grid for Flash Sale Items */}
      <HorizontalScrollContainer className="grid grid-flow-col auto-cols-[140px] sm:auto-cols-[165px] gap-3 sm:gap-3.5 py-1 px-0.5">
        {flashSaleDeals.map((deal) => {
          const favorite = isFavorite(deal.food.id);
          const percentSold = Math.round((deal.soldCount / deal.totalStock) * 100);

          return (
            <div
              key={deal.food.id}
              onClick={() => onSelectFood(deal.food)}
              className="bg-transparent group flex flex-col h-full cursor-pointer select-none transition-all w-full"
            >
              {/* Image Container */}
              <div className="relative aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden border border-[#E9DDE3] shadow-2xs group-hover:shadow-md group-hover:border-[#FF4F8B] transition-all">
                <img
                  src={deal.food.image}
                  alt={deal.food.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Flash Deal Badge */}
                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                  <span className="bg-[#FF4F8B] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5">
                    {deal.badge}
                  </span>
                </div>
              </div>

              {/* Details below */}
              <div className="pt-2 px-0.5 flex-1 flex flex-col justify-between gap-1.5">
                <div>
                  <h3 className="font-bold text-[#1F2937] text-xs sm:text-sm group-hover:text-[#FF4F8B] transition-colors line-clamp-1 leading-tight">
                    {deal.food.name}
                  </h3>

                  {/* Stock Progress Bar */}
                  <div className="mt-1 space-y-0.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-[#64748B]">
                      <span>Đã bán {deal.soldCount}/{deal.totalStock}</span>
                      {percentSold >= 80 && <span className="text-[#FF4F8B] font-extrabold animate-pulse">Sắp hết!</span>}
                    </div>
                    <div className="w-full h-1.5 bg-[#FFE4EE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#FF4F8B] to-[#FF7A59] rounded-full transition-all duration-500"
                        style={{ width: `${percentSold}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-1 flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-[#FF4F8B] flex items-center gap-0.5">
                      {deal.flashPrice.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-[10px] text-[#94A3B8] line-through -mt-0.5 font-medium">
                      {deal.originalPrice.toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(deal.food, 1);
                    }}
                    className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-xl bg-[#FFF3F7] hover:bg-[#FFE4EE] text-[#FF4F8B] border border-[#FFE4EE] flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                    title="Thêm món"
                    aria-label="Thêm món"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </HorizontalScrollContainer>
    </section>
  );
};

