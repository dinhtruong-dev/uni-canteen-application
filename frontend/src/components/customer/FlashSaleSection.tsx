import React, { useState, useEffect } from 'react';
import { Flame, Clock, Plus, Heart, Star, Gift, Sparkles, ChevronRight, Zap, Tag, BadgeCheck, Ticket, Package, ShoppingBag } from 'lucide-react';
import { FoodItem } from '../../types';
import { useApp } from '../../store/AppContext';
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
  const { foods, flashSales, addToCart, toggleFavorite, isFavorite, navigateTo } = useApp();

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

  // Map foods to flash sale deals (Dynamic from DB with fallback)
  const fallbackDeals: FlashSaleItem[] = [
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

  const flashSaleDeals: FlashSaleItem[] =
    flashSales && flashSales.length > 0
      ? flashSales.map((fs) => {
        const foundFood = foods.find((f) => f.id === fs.productId);
        const food: FoodItem = foundFood || {
          id: fs.productId,
          name: fs.productName,
          canteenId: 'cant-a',
          canteenName: 'Căng tin A2',
          categoryId: 'cat-1',
          price: fs.salePrice,
          originalPrice: fs.originalPrice,
          image: fs.productImage,
          description: fs.description || '',
          ingredients: ['Gia vị truyền thống'],
          isBestSeller: true,
          isAvailable: true,
          rating: 4.9,
          reviewCount: 180,
          preparationTime: 10,
        };
        return {
          food,
          flashPrice: fs.salePrice,
          originalPrice: fs.originalPrice,
          soldCount: fs.soldSlots,
          totalStock: fs.totalSlots,
          badge: fs.discountPercent ? `-${fs.discountPercent}%` : 'GIỜ VÀNG',
        };
      })
      : fallbackDeals;

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

              {/* Details below - Giao diện thẻ chuẩn ShopeeFood */}
              <div className="pt-2 px-0.5 flex-1 flex flex-col justify-between gap-1">
                {/* Tên Quán / Món kèm dấu tích xanh Verified */}
                <div className="space-y-1">
                  <div className="flex items-start gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-[#00BFA5] fill-[#00BFA5] text-white shrink-0 mt-0.5" />
                    <h3 className="font-bold text-[#1F2937] text-xs sm:text-[13px] group-hover:text-[#FF4F8B] transition-colors line-clamp-2 leading-snug">
                      {deal.food.canteenName ? `${deal.food.canteenName} - ` : ''}{deal.food.name}
                    </h3>
                  </div>

                  {/* Hàng Đánh giá ⭐ 4.9 (48) và Lượt bán 🛍️ 300+ */}
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium">
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{deal.food.rating || 4.9}</span>
                      <span className="text-[#94A3B8] font-normal text-[9.5px]">({deal.food.reviewCount || 48})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#64748B] shrink-0">
                      <ShoppingBag className="w-3 h-3 text-[#FF5722]" />
                      <span className="text-[#64748B] text-[10px] font-medium">{deal.soldCount > 0 ? `${deal.soldCount * 25}+` : '300+'}</span>
                    </div>
                  </div>
                </div>

                {/* Hàng Voucher kích thích người mua: [🎫 40% / 50k] [📦 Freeship] */}
                <div className="pt-1 mt-auto flex items-center gap-1 flex-wrap">
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] sm:text-[10px] font-bold text-[#FF5722] bg-[#FFF5F2] border border-[#FF5722]/30 px-1.5 py-0.5 rounded leading-tight">
                    <Ticket className="w-2.5 h-2.5 text-[#FF5722] shrink-0" />
                    <span>{deal.badge.startsWith('-') ? deal.badge.replace('-', '') : deal.badge}</span>
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] sm:text-[10px] font-bold text-[#009688] bg-[#E0F7F4] border border-[#00BFA5]/30 px-1.5 py-0.5 rounded leading-tight">
                    <Package className="w-2.5 h-2.5 text-[#00BFA5] shrink-0" />
                    <span>Freeship</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </HorizontalScrollContainer>
    </section>
  );
};

