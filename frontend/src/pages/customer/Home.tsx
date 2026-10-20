import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { FoodCard } from '../../components/customer/FoodCard';
import { BannerSlider } from '../../components/customer/BannerSlider';
import { FlashSaleSection } from '../../components/customer/FlashSaleSection';
import { HorizontalScrollContainer } from '../../components/customer/HorizontalScrollContainer';
import { FoodItem, Canteen, OrderType } from '../../types';
import {
  ShoppingBag,
  Home as HomeIcon,
  Search,
  Sparkles,
  Flame,
  Star,
  Clock,
  MapPin,
  QrCode,
  Tag,
  Gift,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Percent,
  Camera,
  Layers,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';

export const HomeView: React.FC = () => {
  const {
    foods,
    canteens,
    promotions,
    categories,
    setOrderType,
    setSelectedCanteen,
    navigateTo,
    setQrScannerOpen,
    appliedPromotion,
    applyPromotion,
  } = useApp();

  const displayCategories = categories;

  const [searchQuery, setSearchQuery] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bestSellers = foods.filter((f) => f.isBestSeller).slice(0, 6);
  const newFoods = foods.filter((f) => f.isNew || f.rating >= 4.8).slice(0, 6);

  const quickSearchTags = [
    { label: 'Cơm gà chiên mắm', icon: '🍗' },
    { label: 'Bún chả', icon: '🍜' },
    { label: 'Trà đào sảng khoái', icon: '🧋' },
    { label: 'Flash Sale 19K', icon: '⚡' },
    { label: 'Món Chay', icon: '🥗' },
  ];

  const handleSelectOrderMode = (mode: OrderType) => {
    if (mode === 'DINE_IN') {
      setOrderType('DINE_IN');
      navigateTo('qr-scanner');
    } else if (mode === 'DELIVERY') {
      // Mở sang trang mới chọn địa chỉ nhận món KTX
      navigateTo('delivery-location');
    } else if (mode === 'PICKUP') {
      // Mở sang trang mới chọn Căng tin nhận món tại quầy
      navigateTo('select-canteen');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('search', { search: searchQuery });
    } else {
      navigateTo('search');
    }
  };

  const handleTagClick = (tagLabel: string) => {
    if (tagLabel === 'Flash Sale 19K') {
      navigateTo('section-list', { filterType: 'FLASH_SALE', title: 'Flash Sale 19.000đ Giờ Vàng' });
    } else if (tagLabel === 'Món Chay') {
      navigateTo('category', { category: 'cat-8', categoryId: 'cat-8' });
    } else {
      navigateTo('search', { search: tagLabel });
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Sticky Search Bar - Anchored at the top when scrolling, smoothly reveals blurred backdrop when scrolled */}
      <div
        className={`sticky top-0 z-30 transition-all duration-300 ${isScrolled
          ? 'bg-[#FFFDFE]/95 backdrop-blur-md py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-[#E9DDE3]/80 shadow-xs'
          : 'pt-1 pb-2 bg-transparent'
          }`}
      >
        <div
          onClick={() => navigateTo('search')}
          className="relative flex items-center bg-white rounded-2xl border border-[#E9DDE3] hover:border-[#FF4F8B] shadow-2xs hover:shadow-xs transition-all cursor-pointer group min-h-[52px] sm:min-h-[56px]"
        >
          <Search className="w-5 h-5 text-[#FF4F8B] absolute left-4 top-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="w-full pl-12 pr-28 py-3.5 sm:py-4 text-xs sm:text-sm md:text-base font-semibold text-[#94A3B8] select-none flex items-center truncate">
            <span>Matcha Vibe - Matcha Latte Từ 26K</span>
          </div>

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo('qr-scanner');
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#FFF3F7] hover:bg-[#FFE4EE] text-[#FF4F8B] rounded-xl text-xs font-bold transition-all border border-[#FFE4EE] cursor-pointer active:scale-95"
              title="Quét QR bàn hoặc món"
            >
              <Camera className="w-4 h-4 text-[#FF4F8B]" />
              <span className="hidden sm:inline">Quét QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Ordering Mode Options */}
      <section>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {/* Card 1: Dine in */}
          <button
            onClick={() => handleSelectOrderMode('DINE_IN')}
            className="bg-white rounded-xl py-2 px-1.5 border border-[#E9DDE3] hover:border-[#FF4F8B] shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center text-center cursor-pointer group active:scale-95"
          >
            <span className="text-xl sm:text-2xl">🍽️</span>
            <span className="font-semibold text-[#1F2937] text-xs mt-1 group-hover:text-[#FF4F8B] transition-colors truncate w-full">
              Ăn tại chỗ
            </span>
          </button>

          {/* Card 2: Pickup */}
          <button
            onClick={() => handleSelectOrderMode('PICKUP')}
            className="bg-white rounded-xl py-2 px-1.5 border border-[#E9DDE3] hover:border-[#FF7A59] shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center text-center cursor-pointer group active:scale-95"
          >
            <span className="text-xl sm:text-2xl">🏃</span>
            <span className="font-semibold text-[#1F2937] text-xs mt-1 group-hover:text-[#FF7A59] transition-colors truncate w-full">
              Hẹn quầy lấy
            </span>
          </button>

          {/* Card 3: Delivery */}
          <button
            onClick={() => handleSelectOrderMode('DELIVERY')}
            className="bg-white rounded-xl py-2 px-1.5 border border-[#E9DDE3] hover:border-[#22C55E] shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center text-center cursor-pointer group active:scale-95"
          >
            <span className="text-xl sm:text-2xl">🏠</span>
            <span className="font-semibold text-[#1F2937] text-xs mt-1 group-hover:text-[#22C55E] transition-colors truncate w-full">
              Giao KTX
            </span>
          </button>
        </div>
      </section>

      {/* Categories Section - Smooth Horizontal Scroll (Scroll Sang) */}
      <section className="space-y-3">
        {/* Horizontal Swipable Categories with Smooth Scroll - Equal uniform sizing */}
        <HorizontalScrollContainer className="flex items-center gap-2 sm:gap-2.5 py-1 px-0.5">
          {displayCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigateTo('category', { category: cat.id, categoryId: cat.id, categoryName: cat.name })}
              className="flex flex-col items-center text-center cursor-pointer group shrink-0 w-[64px] sm:w-[72px] active:scale-95 transition-transform"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#FFF3F7] group-hover:bg-[#FFE4EE] border border-[#FFE4EE] flex items-center justify-center p-2 transition-transform group-hover:scale-105 shrink-0 shadow-2xs">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>
              <span
                className="font-medium text-[#1F2937] text-[11px] sm:text-xs mt-1.5 truncate w-full px-0.5 group-hover:text-[#FF4F8B] transition-colors block text-center"
                title={cat.name}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </HorizontalScrollContainer>
      </section>

      {/* Interactive Running Banner Slider */}
      <section>
        <BannerSlider
          onBannerClick={(banner) => {
            if (banner.promoCode) {
              applyPromotion(banner.promoCode);
              navigateTo('category');
            } else {
              navigateTo('category');
            }
          }}
        />
      </section>

      {/* Flash Sale Section with Countdown Timer */}
      <FlashSaleSection
        onSelectFood={(selected) =>
          navigateTo('food-detail', { foodId: selected.id, food: selected, fromView: 'home' })
        }
      />

      {/* Best Sellers */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-[#1F2937] flex items-center gap-1.5">
            <Flame className="w-4.5 h-4.5 text-[#FF4F8B]" /> Món bán chạy nhất
          </h2>
          <button
            onClick={() => navigateTo('section-list', { filterType: 'BEST_SELLER', title: 'Món bán chạy nhất' })}
            className="flex items-center gap-0.5 text-xs font-semibold text-[#64748B] hover:text-[#FF4F8B] transition-colors cursor-pointer group"
            title="Xem tất cả món bán chạy"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8] group-hover:text-[#FF4F8B] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        <HorizontalScrollContainer className="grid grid-rows-2 grid-flow-col auto-cols-[142px] sm:auto-cols-[165px] gap-3 sm:gap-4 py-1 px-0.5">
          {bestSellers.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onSelectFood={(selected) =>
                navigateTo('food-detail', { foodId: selected.id, food: selected, fromView: 'home' })
              }
            />
          ))}
        </HorizontalScrollContainer>
      </section>

      {/* Canteen List Section - Bigger Height & Image */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-[#1F2937] flex items-center gap-1.5">
            <MapPin className="w-4.5 h-4.5 text-[#FF4F8B]" /> Hệ thống Căng tin trong trường
          </h2>
          <button
            onClick={() => navigateTo('section-list', { filterType: 'CANTEEN_LIST', title: 'Hệ thống Căng tin trong trường' })}
            className="flex items-center gap-0.5 text-xs font-semibold text-[#64748B] hover:text-[#FF4F8B] transition-colors cursor-pointer group"
            title="Xem tất cả căng tin"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8] group-hover:text-[#FF4F8B] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {canteens.map((canteen) => (
            <div
              key={canteen.id}
              onClick={() => {
                setSelectedCanteen(canteen);
                navigateTo('category', { canteenId: canteen.id, canteen, fromView: 'home' });
              }}
              className="bg-white rounded-2xl border border-[#E9DDE3] p-3 shadow-xs hover:shadow-md hover:border-[#FF4F8B] transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              {/* Ảnh bên trái */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <img
                  src={canteen.image}
                  alt={canteen.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs ${canteen.isOpen
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-slate-800 text-slate-200'
                    }`}
                >
                  {canteen.isOpen ? 'Mở cửa' : 'Đóng cửa'}
                </span>
              </div>

              {/* Thông tin bên phải */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                {/* Hàng 1: Tên & Địa chỉ */}
                <div>
                  <h3 className="font-semibold text-[#1F2937] text-sm sm:text-base truncate group-hover:text-[#FF4F8B] transition-colors">
                    {canteen.name}
                  </h3>
                  <p className="text-xs text-[#64748B] truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                    <span>{canteen.location}</span>
                  </p>
                </div>

                {/* Hàng 2: Số sao */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('food-reviews', { canteenId: canteen.id, canteen, isCanteen: true });
                  }}
                  className="w-fit flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-[#FF4F8B] transition-colors cursor-pointer group/star"
                  title="Xem đánh giá căng tin"
                >
                  <Star className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="text-[#1F2937] font-bold">{canteen.rating}</span>
                  <span className="text-[#94A3B8] font-normal">({canteen.reviewCount})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover/star:text-[#FF4F8B] group-hover/star:translate-x-0.5 transition-transform" />
                </button>

                {/* Hàng 3: Giờ mở cửa */}
                <p className="text-xs text-[#64748B] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                  <span>{canteen.openingHours}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New & Recommended Foods */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-[#1F2937] flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-amber-500" /> Món ăn đáng thử hôm nay
          </h2>
          <button
            onClick={() => navigateTo('section-list', { filterType: 'NEW', title: 'Món ăn đáng thử hôm nay' })}
            className="flex items-center gap-0.5 text-xs font-semibold text-[#64748B] hover:text-[#FF4F8B] transition-colors cursor-pointer group"
            title="Xem tất cả món đáng thử"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8] group-hover:text-[#FF4F8B] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        <HorizontalScrollContainer className="grid grid-rows-2 grid-flow-col auto-cols-[142px] sm:auto-cols-[165px] gap-3 sm:gap-4 py-1 px-0.5">
          {newFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onSelectFood={(selected) =>
                navigateTo('food-detail', { foodId: selected.id, food: selected, fromView: 'home' })
              }
            />
          ))}
        </HorizontalScrollContainer>
      </section>
    </div>
  );
};
