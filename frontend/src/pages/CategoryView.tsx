import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_CATEGORIES } from '../data/mockData';
import { FoodItem } from '../types';
import {
  ArrowLeft,
  Share2,
  Search,
  SlidersHorizontal,
  X,
  Star,
  Clock,
  ShoppingBag,
  Ticket,
  PackageCheck,
  ChevronDown,
  CheckCircle2,
  Tag,
  Zap,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryViewProps {
  categoryId?: string;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ categoryId }) => {
  const { foods, canteens, selectedCanteen, viewParams, navigateTo, addToCart, showToast } = useApp();

  const initialCatId = categoryId || viewParams?.category || viewParams?.categoryId || MOCK_CATEGORIES[0]?.id || 'cat-1';
  const [selectedCatId, setSelectedCatId] = useState<string>(initialCatId);
  const [searchQuery, setSearchQuery] = useState<string>(viewParams?.search || '');
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>(
    selectedCanteen ? selectedCanteen.id : 'ALL'
  );
  
  // Filter bar states matching the image
  const [isPromoOnly, setIsPromoOnly] = useState<boolean>(false);
  const [pricePreset, setPricePreset] = useState<'ALL' | 'UNDER_30' | '30_50' | 'ABOVE_50'>('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'RATING' | 'NEAR'>('POPULAR');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewParams?.category) {
      setSelectedCatId(viewParams.category);
    } else if (viewParams?.categoryId) {
      setSelectedCatId(viewParams.categoryId);
    }
  }, [viewParams]);

  const currentCategory = useMemo(() => {
    return MOCK_CATEGORIES.find((c) => c.id === selectedCatId) || MOCK_CATEGORIES[0];
  }, [selectedCatId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${currentCategory.name} - UniEat`,
        text: `Khám phá các món ${currentCategory.name} siêu ngon giá sinh viên trên UniEat!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Đã sao chép liên kết danh mục!', 'success');
    }
  };

  // Filter foods for current category
  const categoryFoods = useMemo(() => {
    let result = foods.filter((f) => f.categoryId === selectedCatId);

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );
    }

    // Promo only filter
    if (isPromoOnly) {
      result = result.filter((f) => (f.originalPrice && f.originalPrice > f.price) || f.isBestSeller);
    }

    // Canteen filter
    if (selectedCanteenId !== 'ALL') {
      result = result.filter((f) => f.canteenId === selectedCanteenId);
    }

    // Price filter
    if (pricePreset === 'UNDER_30') {
      result = result.filter((f) => f.price <= 30000);
    } else if (pricePreset === '30_50') {
      result = result.filter((f) => f.price >= 30000 && f.price <= 50000);
    } else if (pricePreset === 'ABOVE_50') {
      result = result.filter((f) => f.price > 50000);
    }

    // Sorting
    if (sortBy === 'PRICE_LOW') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_HIGH') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'RATING') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => (b.soldCount || b.reviewCount) - (a.soldCount || a.reviewCount));
    }

    return result;
  }, [foods, selectedCatId, searchQuery, isPromoOnly, selectedCanteenId, pricePreset, sortBy]);

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto">
      {/* 1. Header matching exact image: Back arrow, Centered Title, Share icon */}
      <div className="sticky top-0 z-30 bg-[#FFFDFE]/95 backdrop-blur-md pt-2 pb-3 border-b border-[#E9DDE3] -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateTo('home')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#1F2937] hover:bg-[#FFF3F7] active:scale-95 transition-all cursor-pointer"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
          </button>

          <h1 className="text-base sm:text-lg font-bold text-[#1F2937] text-center truncate max-w-[200px] sm:max-w-md">
            {currentCategory.name}
          </h1>

          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#1F2937] hover:bg-[#FFF3F7] active:scale-95 transition-all cursor-pointer"
            aria-label="Chia sẻ"
            title="Chia sẻ danh mục"
          >
            <Share2 className="w-5 h-5 text-[#1F2937]" />
          </button>
        </div>

        {/* 2. Search Input bar */}
        <div className="mt-2.5 relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhà hàng hoặc món ăn..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-100/90 border border-transparent focus:border-[#FF4F8B] focus:bg-white text-xs sm:text-sm font-medium text-[#1F2937] placeholder-[#94A3B8] focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3. Horizontal Filter Pills matching the screenshot */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-2.5 pb-1">
          {/* Sliders Filter Button */}
          <button
            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
            className={`flex items-center justify-center p-2 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer ${
              isFilterModalOpen || selectedCanteenId !== 'ALL'
                ? 'bg-[#FF4F8B] text-white border-[#FF4F8B]'
                : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#FF4F8B]'
            }`}
            title="Bộ lọc nâng cao"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Khuyến mại Pill */}
          <button
            onClick={() => setIsPromoOnly(!isPromoOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer select-none active:scale-95 ${
              isPromoOnly
                ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B] shadow-2xs'
                : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#FF4F8B]'
            }`}
          >
            <span className="text-sm">🎟️</span>
            <span>Khuyến mại</span>
          </button>

          {/* Sắp xếp Dropdown Pill */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                sortBy !== 'POPULAR'
                  ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B]'
                  : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#FF4F8B]'
              }`}
            >
              <span>
                {sortBy === 'POPULAR' && 'Sắp xếp'}
                {sortBy === 'PRICE_LOW' && 'Giá thấp'}
                {sortBy === 'PRICE_HIGH' && 'Giá cao'}
                {sortBy === 'RATING' && 'Đánh giá'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute top-full left-0 mt-1.5 bg-white border border-[#E9DDE3] rounded-2xl shadow-xl py-1.5 z-40 min-w-[140px]">
                {[
                  { id: 'POPULAR', label: 'Phổ biến nhất' },
                  { id: 'PRICE_LOW', label: 'Giá: Thấp đến cao' },
                  { id: 'PRICE_HIGH', label: 'Giá: Cao đến thấp' },
                  { id: 'RATING', label: 'Đánh giá cao nhất' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSortBy(s.id as any);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#FFF3F7] cursor-pointer transition-colors ${
                      sortBy === s.id ? 'text-[#FF4F8B] font-bold bg-[#FFF3F7]' : 'text-[#1F2937]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dưới 30k Pill */}
          <button
            onClick={() => setPricePreset(pricePreset === 'UNDER_30' ? 'ALL' : 'UNDER_30')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer select-none active:scale-95 ${
              pricePreset === 'UNDER_30'
                ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B] shadow-2xs'
                : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#FF4F8B]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#FF7A59] fill-[#FF7A59]" />
            <span>Dưới 30k</span>
          </button>

          {/* Canteen Fast Switch */}
          <div className="relative shrink-0">
            <select
              value={selectedCanteenId}
              onChange={(e) => setSelectedCanteenId(e.target.value)}
              className="appearance-none bg-white border border-[#E9DDE3] rounded-xl pl-3 pr-7 py-1.5 text-xs font-bold text-[#1F2937] hover:border-[#FF4F8B] focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="ALL">🏛️ Tất cả Căng tin</option>
              {canteens.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 4. Horizontal Quick Category Scroll Switcher */}
        <div
          ref={categoryScrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth pt-2"
        >
          {MOCK_CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedCatId;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCatId(cat.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 transition-all border text-xs font-bold cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-[#FF4F8B] text-white border-[#FF4F8B] shadow-xs'
                    : 'bg-white hover:bg-[#FFF3F7] text-[#64748B] border-[#E9DDE3] hover:text-[#FF4F8B]'
                }`}
              >
                <img src={cat.image} alt={cat.name} className="w-4 h-4 object-contain" />
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-[#E9DDE3] p-4 space-y-3 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF4F8B]" /> Lọc món chi tiết
              </span>
              <button
                onClick={() => {
                  setPricePreset('ALL');
                  setSelectedCanteenId('ALL');
                  setIsPromoOnly(false);
                  setSortBy('POPULAR');
                }}
                className="text-xs font-bold text-[#FF4F8B] hover:underline cursor-pointer"
              >
                Đặt lại
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#64748B]">Mức giá:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'ALL', label: 'Tất cả mức giá' },
                  { id: 'UNDER_30', label: 'Dưới 30.000đ' },
                  { id: '30_50', label: '30.000đ - 50.000đ' },
                  { id: 'ABOVE_50', label: 'Trên 50.000đ' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPricePreset(p.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      pricePreset === p.id
                        ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B]'
                        : 'bg-slate-50 text-[#64748B] border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Food List matching exact ShopeeFood / Delivery Row Design from Image */}
      <div className="divide-y divide-[#E9DDE3]/80 bg-white rounded-3xl border border-[#E9DDE3] shadow-2xs overflow-hidden">
        {categoryFoods.length > 0 ? (
          categoryFoods.map((food) => {
            const canteen = canteens.find((c) => c.id === food.canteenId);
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
                    fromView: 'category',
                    fromParams: { category: selectedCatId },
                  })
                }
                className="p-3 sm:p-4 hover:bg-[#FFFDFE] transition-all flex items-start gap-3 sm:gap-4 group cursor-pointer"
              >
                {/* Left: Large Rounded Square Image with Promo Overlay */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-[#E9DDE3] shadow-2xs group-hover:border-[#FF4F8B] transition-all">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Discount Badge on Image */}
                  <div className="absolute bottom-1.5 left-1.5 flex flex-wrap gap-1 z-10">
                    {discountPct > 0 ? (
                      <span className="bg-[#06B6D4] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" />
                        {discountPct}%
                      </span>
                    ) : food.isBestSeller ? (
                      <span className="bg-[#FF4F8B] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs">
                        Bán chạy
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Right: Store & Dish Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                  <div>
                    {/* Verified Badge & Store/Dish Title */}
                    <div className="flex items-start gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5 fill-[#06B6D4]/10" />
                      <h3 className="font-bold text-[#1F2937] text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#FF4F8B] transition-colors">
                        {food.name} {canteen ? ` - ${canteen.name}` : ''}
                      </h3>
                    </div>

                    {/* Stats Row: Star Rating • Sold Count • Prep/Delivery Time */}
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

                  {/* Price & Voucher Badge Row */}
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Price with Ticket Icon */}
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

                      {/* Add Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if ((food.sizes && food.sizes.length > 0) || (food.toppings && food.toppings.length > 0)) {
                            navigateTo('food-detail', {
                              foodId: food.id,
                              food,
                              fromView: 'category',
                              fromParams: { category: selectedCatId },
                            });
                          } else {
                            addToCart(food, 1);
                            showToast(`Đã thêm "${food.name}" vào giỏ hàng`, 'success');
                          }
                        }}
                        className="w-8 h-8 rounded-xl bg-[#FFF3F7] hover:bg-[#FFE4EE] text-[#FF4F8B] border border-[#FFE4EE] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                        title="Thêm vào giỏ"
                        aria-label="Thêm vào giỏ"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Freeship Badge */}
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#06B6D4]">
                      <PackageCheck className="w-3 h-3 text-[#06B6D4]" />
                      <span>Freeship tận KTX & Phòng học</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#FFF3F7] border border-[#FFE4EE] flex items-center justify-center mx-auto text-3xl">
              🍽️
            </div>
            <h3 className="text-base font-bold text-[#1F2937]">Không tìm thấy món ăn nào</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Thử bỏ bớt bộ lọc hoặc chọn danh mục khác để xem thêm nhiều món ngon bạn nhé!
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setIsPromoOnly(false);
                setPricePreset('ALL');
                setSelectedCanteenId('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-[#FF4F8B] text-white font-bold text-xs hover:bg-[#E83E78] transition-all cursor-pointer shadow-xs"
            >
              Xem tất cả món {currentCategory.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

