import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem } from '../types';
import {
  ArrowLeft,
  Share2,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Store,
  MapPin,
  Plus,
  Star,
  Clock,
  Utensils,
  X,
  Zap,
  ShoppingBag,
  Ticket,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';

export const SectionListView: React.FC = () => {
  const { foods, canteens, viewParams, navigateTo, addToCart, setSelectedCanteen, showToast } = useApp();

  const filterType = viewParams?.filterType || 'BEST_SELLER';
  const pageTitle = viewParams?.title || 'Danh sách món ăn';

  // Active Dropdown / Modal Filter State
  const [activeDropdown, setActiveDropdown] = useState<'NONE' | 'FILTER' | 'DISCOUNT' | 'PRICE'>('NONE');

  // Filter values
  const [discountFilter, setDiscountFilter] = useState<number>(filterType === 'FLASH_SALE' ? 1 : 0);
  const [pricePreset, setPricePreset] = useState<'ALL' | 'UNDER_25' | '25_50' | 'ABOVE_50' | 'CUSTOM'>('ALL');
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState<'DEFAULT' | 'DISCOUNT_HIGH' | 'PRICE_LOW' | 'PRICE_HIGH'>('DEFAULT');

  // Live countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 41, seconds: 39 });

  useEffect(() => {
    if (filterType !== 'FLASH_SALE') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [filterType]);

  const formatTimeNum = (num: number) => num.toString().padStart(2, '0');

  // Filter food items
  const filteredFoods = useMemo(() => {
    if (filterType === 'CANTEEN_LIST') return [];

    let list = [...foods];

    // Base type filtering
    if (filterType === 'FLASH_SALE') {
      list = list.filter((f) => (f.originalPrice && f.originalPrice > f.price) || f.isBestSeller);
    } else if (filterType === 'BEST_SELLER') {
      list = list.filter((f) => f.isBestSeller);
    } else if (filterType === 'NEW') {
      list = list.filter((f) => f.isNew || f.rating >= 4.8);
    }

    // Discount Filter
    if (discountFilter === 1) {
      list = list.filter((f) => f.originalPrice && f.originalPrice > f.price);
    } else if (discountFilter > 1) {
      list = list.filter((f) => {
        if (!f.originalPrice || f.originalPrice <= f.price) return false;
        const pct = Math.round(((f.originalPrice - f.price) / f.originalPrice) * 100);
        return pct >= discountFilter;
      });
    }

    // Price Filter
    if (pricePreset === 'UNDER_25') {
      list = list.filter((f) => f.price <= 25000);
    } else if (pricePreset === '25_50') {
      list = list.filter((f) => f.price >= 25000 && f.price <= 50000);
    } else if (pricePreset === 'ABOVE_50') {
      list = list.filter((f) => f.price > 50000);
    } else if (pricePreset === 'CUSTOM') {
      if (customMinPrice) list = list.filter((f) => f.price >= Number(customMinPrice));
      if (customMaxPrice) list = list.filter((f) => f.price <= Number(customMaxPrice));
    }

    // Sort
    if (sortOption === 'DISCOUNT_HIGH') {
      list.sort((a, b) => {
        const discA = a.originalPrice ? a.originalPrice - a.price : 0;
        const discB = b.originalPrice ? b.originalPrice - b.price : 0;
        return discB - discA;
      });
    } else if (sortOption === 'PRICE_LOW') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'PRICE_HIGH') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [
    foods,
    filterType,
    discountFilter,
    pricePreset,
    customMinPrice,
    customMaxPrice,
    sortOption,
  ]);

  const filteredCanteens = useMemo(() => {
    if (filterType !== 'CANTEEN_LIST') return [];
    return [...canteens];
  }, [canteens, filterType]);

  const resetFilters = () => {
    setDiscountFilter(0);
    setPricePreset('ALL');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setSortOption('DEFAULT');
    setActiveDropdown('NONE');
  };

  const handleQuickAdd = (e: React.MouseEvent, food: FoodItem) => {
    e.stopPropagation();
    if ((food.sizes && food.sizes.length > 0) || (food.toppings && food.toppings.length > 0)) {
      navigateTo('food-detail', {
        foodId: food.id,
        food,
        fromView: 'section-list',
        fromParams: { filterType, title: pageTitle },
      });
    } else {
      addToCart(food, 1);
      showToast(`Đã thêm "${food.name}" vào giỏ hàng`, 'success');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: pageTitle, url: window.location.href }).catch(() => {});
    } else {
      showToast('Đã sao chép liên kết chia sẻ', 'info');
    }
  };

  // Helper text for discount filter pill
  const getDiscountPillLabel = () => {
    if (discountFilter === 0) return 'Món có giảm giá';
    if (discountFilter === 1) return 'Có giảm giá';
    return `Giảm từ ${discountFilter}%`;
  };

  // Helper text for price filter pill
  const getPricePillLabel = () => {
    if (pricePreset === 'ALL') return 'Khoảng giá món';
    if (pricePreset === 'UNDER_25') return 'Dưới 25k';
    if (pricePreset === '25_50') return '25k - 50k';
    if (pricePreset === 'ABOVE_50') return 'Trên 50k';
    return 'Khoảng giá';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 px-1 sm:px-0">
      {/* 1. Header: Back Arrow on left, Title in center, Share on right */}
      <div className="sticky top-0 z-30 bg-[#FFFDFE]/95 backdrop-blur-md pt-2 pb-3 border-b border-[#E9DDE3] flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#1F2937] hover:bg-[#FFF3F7] active:scale-95 transition-all cursor-pointer shrink-0"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
        </button>

        <h1 className="font-bold text-[#1F2937] text-base sm:text-lg flex items-center gap-1.5 text-center truncate">
          {filterType === 'FLASH_SALE' && <Zap className="w-5 h-5 text-[#FF4F8B] fill-[#FF4F8B]" />}
          {filterType === 'BEST_SELLER' && <span className="text-xl">🔥</span>}
          {filterType === 'NEW' && <span className="text-xl">✨</span>}
          <span>{pageTitle}</span>
        </h1>

        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#1F2937] hover:bg-[#FFF3F7] active:scale-95 transition-all cursor-pointer shrink-0"
          title="Chia sẻ"
        >
          <Share2 className="w-5 h-5 text-[#1F2937]" />
        </button>
      </div>

      {/* 2. Horizontal Filter Pill Bar (ONLY for Flash Sale) */}
      {filterType === 'FLASH_SALE' && (
        <div className="relative space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Round Filter Icon Button */}
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'FILTER' ? 'NONE' : 'FILTER')}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                activeDropdown === 'FILTER' || discountFilter > 0 || pricePreset !== 'ALL'
                  ? 'bg-[#FF4F8B] text-white border-[#FF4F8B]'
                  : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#FF4F8B]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Pill 1: Món có giảm giá */}
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'DISCOUNT' ? 'NONE' : 'DISCOUNT')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                discountFilter > 0
                  ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B]'
                  : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#FF4F8B]'
              }`}
            >
              <span>🎟️ {getDiscountPillLabel()}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Pill 2: Khoảng giá món */}
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'PRICE' ? 'NONE' : 'PRICE')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                pricePreset !== 'ALL'
                  ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B]'
                  : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#FF4F8B]'
              }`}
            >
              <span>⚡ {getPricePillLabel()}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dropdown Popover Panels */}
          {activeDropdown !== 'NONE' && (
            <div className="bg-white rounded-2xl p-4 border border-[#E9DDE3] shadow-lg space-y-3 z-20 relative">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                  {activeDropdown === 'DISCOUNT' && 'Mức giảm giá'}
                  {activeDropdown === 'PRICE' && 'Lọc khoảng giá'}
                  {activeDropdown === 'FILTER' && 'Tất cả bộ lọc'}
                </span>
                <button
                  onClick={() => setActiveDropdown('NONE')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Discount Options */}
              {(activeDropdown === 'DISCOUNT' || activeDropdown === 'FILTER') && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[#64748B]">Mức giảm tối thiểu:</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {[
                      { val: 0, label: 'Tất cả' },
                      { val: 1, label: 'Có giảm' },
                      { val: 20, label: '≥ 20%' },
                      { val: 30, label: '≥ 30%' },
                      { val: 50, label: '≥ 50%' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          setDiscountFilter(opt.val);
                          if (activeDropdown === 'DISCOUNT') setActiveDropdown('NONE');
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold text-center cursor-pointer ${
                          discountFilter === opt.val
                            ? 'bg-[#FF4F8B] text-white'
                            : 'bg-slate-100 text-[#1F2937] hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Options */}
              {(activeDropdown === 'PRICE' || activeDropdown === 'FILTER') && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-[#64748B]">Khoảng giá món:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'ALL', label: 'Tất cả' },
                      { id: 'UNDER_25', label: 'Dưới 25k' },
                      { id: '25_50', label: '25k - 50k' },
                      { id: 'ABOVE_50', label: 'Trên 50k' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPricePreset(p.id as any);
                          setCustomMinPrice('');
                          setCustomMaxPrice('');
                          if (activeDropdown === 'PRICE') setActiveDropdown('NONE');
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold text-center cursor-pointer ${
                          pricePreset === p.id
                            ? 'bg-[#FF4F8B] text-white'
                            : 'bg-slate-100 text-[#1F2937] hover:bg-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Countdown Timer */}
      {filterType === 'FLASH_SALE' && (
        <div className="flex items-center gap-2 py-1 bg-white p-3 rounded-2xl border border-[#E9DDE3]">
          <span className="text-xs font-bold text-[#64748B]">Kết thúc sau</span>
          <div className="flex items-center gap-1 font-mono text-xs font-bold">
            <span className="bg-[#1F2937] text-white px-2 py-1 rounded-md shadow-2xs">
              {formatTimeNum(timeLeft.hours)}
            </span>
            <span className="text-[#1F2937] font-black">:</span>
            <span className="bg-[#1F2937] text-white px-2 py-1 rounded-md shadow-2xs">
              {formatTimeNum(timeLeft.minutes)}
            </span>
            <span className="text-[#1F2937] font-black">:</span>
            <span className="bg-[#FF4F8B] text-white px-2 py-1 rounded-md shadow-2xs animate-pulse">
              {formatTimeNum(timeLeft.seconds)}
            </span>
          </div>
        </div>
      )}

      {/* 4. Food Cards List in exact delivery row design */}
      {filterType === 'CANTEEN_LIST' ? (
        <div className="space-y-2.5">
          {filteredCanteens.map((canteen) => (
            <div
              key={canteen.id}
              onClick={() => {
                setSelectedCanteen(canteen);
                navigateTo('category', { canteenId: canteen.id, canteen, fromView: 'section-list' });
              }}
              className="bg-white rounded-2xl border border-[#E9DDE3] p-3 shadow-2xs hover:shadow-xs hover:border-[#FF4F8B] transition-all flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <img
                  src={canteen.image}
                  alt={canteen.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    canteen.isOpen ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {canteen.isOpen ? 'Mở cửa' : 'Đóng cửa'}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-bold text-[#1F2937] text-sm truncate group-hover:text-[#FF4F8B] transition-colors">
                    {canteen.name}
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo('food-reviews', { canteenId: canteen.id, canteen, isCanteen: true });
                    }}
                    className="flex items-center gap-0.5 text-xs font-semibold text-amber-500 hover:text-[#FF4F8B] shrink-0 cursor-pointer"
                    title="Xem đánh giá căng tin"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-[#1F2937]">{canteen.rating}</span>
                    <span className="text-slate-400 font-normal text-[11px]">({canteen.reviewCount})</span>
                  </button>
                </div>

                <p className="text-xs text-[#64748B] truncate flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{canteen.location}</span>
                </p>

                <p className="text-xs text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{canteen.openingHours}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-[#E9DDE3]/80 bg-white rounded-3xl border border-[#E9DDE3] shadow-2xs overflow-hidden">
          {filteredFoods.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-medium">Không tìm thấy món ăn phù hợp</p>
            </div>
          ) : (
            filteredFoods.map((food) => {
              const discountPct = food.originalPrice
                ? Math.round(((food.originalPrice - food.price) / food.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={food.id}
                  onClick={() =>
                    navigateTo('food-detail', {
                      foodId: food.id,
                      food,
                      fromView: 'section-list',
                      fromParams: { filterType, title: pageTitle },
                    })
                  }
                  className="p-3 sm:p-4 hover:bg-[#FFFDFE] transition-all flex items-start gap-3 sm:gap-4 group cursor-pointer"
                >
                  {/* Left: Large Rounded Square Image */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-[#E9DDE3] shadow-2xs group-hover:border-[#FF4F8B] transition-all">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount Badge on Image */}
                    <div className="absolute bottom-1.5 left-1.5 flex flex-wrap gap-1 z-10">
                      {discountPct > 0 ? (
                        <span className="bg-[#06B6D4] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs">
                          {discountPct}%
                        </span>
                      ) : food.isBestSeller ? (
                        <span className="bg-[#FF4F8B] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs">
                          Bán chạy
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Right: Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                    <div>
                      {/* Title */}
                      <div className="flex items-start gap-1">
                        <CheckCircle2 className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5 fill-[#06B6D4]/10" />
                        <h3 className="font-bold text-[#1F2937] text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#FF4F8B] transition-colors">
                          {food.name} {food.canteenName ? ` - ${food.canteenName}` : ''}
                        </h3>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#64748B] font-medium mt-1">
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[#1F2937]">{food.rating}</span>
                          <span className="text-[#94A3B8] font-normal">({food.reviewCount})</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-[#64748B]">
                          <ShoppingBag className="w-3 h-3 text-[#94A3B8]" />
                          <span>{food.soldCount ? `${food.soldCount}+` : `${food.reviewCount * 3}+`}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-[#64748B]">
                          <Clock className="w-3 h-3 text-[#94A3B8]" />
                          <span>{food.preparationTime || 15} phút</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-[#FF4F8B] bg-[#FFF3F7] px-2 py-0.5 rounded-lg border border-[#FFE4EE]">
                            <Ticket className="w-3 h-3 text-[#FF4F8B]" />
                            <span>{food.price.toLocaleString('vi-VN')}đ</span>
                          </div>

                          {food.originalPrice && food.originalPrice > food.price && (
                            <span className="text-[11px] text-[#94A3B8] line-through font-medium">
                              {food.originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleQuickAdd(e, food)}
                          className="w-8 h-8 rounded-xl bg-[#FFF3F7] hover:bg-[#FFE4EE] text-[#FF4F8B] border border-[#FFE4EE] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                          title="Thêm vào giỏ"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#06B6D4]">
                        <PackageCheck className="w-3 h-3 text-[#06B6D4]" />
                        <span>Freeship tận KTX & Phòng học</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
