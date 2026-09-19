import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem } from '../types';
import {
  ArrowLeft,
  Search,
  X,
  Clock,
  Trash2,
  TrendingUp,
  Heart,
  Star,
  Plus,
  ShoppingBag,
  Ticket,
  CheckCircle2,
  Camera,
  Utensils,
  Flame,
} from 'lucide-react';

const RECENT_SEARCHES_KEY = 'unieat_recent_searches';
const DEFAULT_RECENT_SEARCHES = [
  'Cơm gà chiên mắm',
  'Trà đào cam sả',
  'Bún chả Hà Nội',
  'Flash Sale 19k',
  'Cơm tấm sườn nướng',
];

const SUGGESTED_KEYWORDS = [
  { text: 'Flash Sale Giờ Vàng', icon: '⚡', isHot: true },
  { text: 'Cơm gà chiên mắm', icon: '🍗' },
  { text: 'Trà sữa trân châu', icon: '🧋', isHot: true },
  { text: 'Phở bò tái nạm', icon: '🍜' },
  { text: 'Món Chay thanh đạm', icon: '🥗' },
  { text: 'Cà phê muối', icon: '☕' },
  { text: 'Bánh mì chảo', icon: '🍳' },
  { text: 'Ăn vặt', icon: '🍟' },
];

export const SearchView: React.FC = () => {
  const { foods, viewParams, navigateTo, addToCart, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>(viewParams?.search || '');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_RECENT_SEARCHES;
    } catch {
      return DEFAULT_RECENT_SEARCHES;
    }
  });

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PROMO' | 'UNDER_30' | 'RATING_HIGH'>('ALL');

  // Save recent searches to localStorage
  const saveRecentSearches = (items: string[]) => {
    setRecentSearches(items);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const handleAddRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const filtered = recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 10);
    saveRecentSearches(updated);
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== itemToRemove);
    saveRecentSearches(updated);
  };

  const handleClearAllRecentSearches = () => {
    saveRecentSearches([]);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      handleAddRecentSearch(searchQuery);
    }
  };

  const handleSelectKeyword = (keyword: string) => {
    setSearchQuery(keyword);
    handleAddRecentSearch(keyword);
  };

  // Filtered food results when search query is typed
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    let list = foods.filter((f) => {
      const matchName = f.name.toLowerCase().includes(q);
      const matchDesc = f.description?.toLowerCase().includes(q);
      const matchCanteen = f.canteenName?.toLowerCase().includes(q);
      const matchCategory = f.categoryName?.toLowerCase().includes(q);
      return matchName || matchDesc || matchCanteen || matchCategory;
    });

    if (activeFilter === 'PROMO') {
      list = list.filter((f) => f.originalPrice && f.originalPrice > f.price);
    } else if (activeFilter === 'UNDER_30') {
      list = list.filter((f) => f.price <= 30000);
    } else if (activeFilter === 'RATING_HIGH') {
      list = list.filter((f) => f.rating >= 4.7);
    }

    return list;
  }, [foods, searchQuery, activeFilter]);

  // "Bạn có thể thích" full recommended list sorted by rating (3 items per row, scrolls seamlessly)
  const recommendedFoods = useMemo(() => {
    return [...foods].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [foods]);

  const handleQuickAdd = (e: React.MouseEvent, food: FoodItem) => {
    e.stopPropagation();
    if ((food.sizes && food.sizes.length > 0) || (food.toppings && food.toppings.length > 0)) {
      navigateTo('food-detail', {
        foodId: food.id,
        food,
        fromView: 'search',
        fromParams: { search: searchQuery },
      });
    } else {
      addToCart(food, 1);
      showToast(`Đã thêm "${food.name}" vào giỏ hàng`, 'success');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 px-1 sm:px-0">
      {/* 1. Sticky Search Header - Smoothly reveals blurred backdrop when scrolled, search box has generous height */}
      <div
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FFFDFE]/95 backdrop-blur-md py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-[#E9DDE3]/80 shadow-xs'
            : 'pt-1 pb-2 bg-transparent'
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 sm:gap-2.5">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#1F2937] hover:bg-[#FFF3F7] active:scale-95 transition-all cursor-pointer shrink-0"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
          </button>

          {/* Search Input Box with generous height */}
          <div className="relative flex-1 flex items-center bg-white rounded-2xl border border-[#E9DDE3] focus-within:border-[#FF4F8B] focus-within:ring-3 focus-within:ring-[#FF4F8B]/20 shadow-2xs transition-all min-h-[52px] sm:min-h-[56px]">
            <Search className="w-5 h-5 text-[#FF4F8B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bạn muốn ăn gì hôm nay?..."
              className="w-full pl-12 pr-20 py-3.5 sm:py-4 text-xs sm:text-sm md:text-base font-semibold text-[#1F2937] placeholder-[#94A3B8] bg-transparent focus:outline-none"
            />

            {/* Clear button inside input */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                title="Xóa chữ"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* QR Scanner shortcut */}
            <button
              type="button"
              onClick={() => navigateTo('qr-scanner')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 text-[#FF4F8B] hover:bg-[#FFF3F7] rounded-xl cursor-pointer"
              title="Quét QR món"
            >
              <Camera className="w-4.5 h-4.5 text-[#FF4F8B]" />
            </button>
          </div>

          {/* Search Action Button */}
          <button
            type="submit"
            className="px-4 py-3 sm:py-3.5 bg-[#FF4F8B] hover:bg-[#E83E78] text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* 2. Content Switching: When Search Query is Present vs. When Empty */}
      {searchQuery.trim() ? (
        /* SEARCH RESULTS VIEW */
        <div className="space-y-4">
          {/* Filter Pills for Search Results */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'PROMO', label: '⚡ Có giảm giá' },
              { id: 'UNDER_30', label: '💰 Dưới 30k' },
              { id: 'RATING_HIGH', label: '⭐ Đánh giá cao' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-[#FF4F8B] text-white shadow-2xs'
                    : 'bg-white text-[#1F2937] border border-[#E9DDE3] hover:border-[#FF4F8B]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#64748B]">
              Tìm thấy <span className="text-[#FF4F8B]">{searchResults.length}</span> món cho "{searchQuery}"
            </p>
          </div>

          {/* Results List */}
          {searchResults.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#E9DDE3] text-center space-y-3 shadow-2xs">
              <Utensils className="w-10 h-10 text-[#94A3B8] mx-auto opacity-60" />
              <div>
                <p className="text-sm font-bold text-[#1F2937]">Không tìm thấy món ăn phù hợp</p>
                <p className="text-xs text-[#64748B] mt-1">Hãy thử tìm với các từ khóa phổ biến bên dưới</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {SUGGESTED_KEYWORDS.slice(0, 4).map((kw) => (
                  <button
                    key={kw.text}
                    onClick={() => handleSelectKeyword(kw.text)}
                    className="px-3 py-1.5 bg-[#FFF3F7] text-[#FF4F8B] text-xs font-bold rounded-full hover:bg-[#FFE4EE] cursor-pointer transition-colors"
                  >
                    {kw.icon} {kw.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#E9DDE3]/80 bg-white rounded-3xl border border-[#E9DDE3] shadow-2xs overflow-hidden">
              {searchResults.map((food) => {
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
                        fromView: 'search',
                        fromParams: { search: searchQuery },
                      })
                    }
                    className="p-3 sm:p-4 hover:bg-[#FFFDFE] transition-all flex items-start gap-3 sm:gap-4 group cursor-pointer"
                  >
                    {/* Left: Food Image */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-[#E9DDE3] shadow-2xs group-hover:border-[#FF4F8B] transition-all">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {discountPct > 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#06B6D4] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs">
                          {discountPct}%
                        </span>
                      )}
                    </div>

                    {/* Right: Food Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                      <div>
                        <div className="flex items-start gap-1">
                          <CheckCircle2 className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5 fill-[#06B6D4]/10" />
                          <h3 className="font-bold text-[#1F2937] text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-[#FF4F8B] transition-colors">
                            {food.name} {food.canteenName ? ` - ${food.canteenName}` : ''}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#64748B] font-medium mt-1">
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-[#1F2937]">{food.rating}</span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-1 text-[#64748B]">
                            <ShoppingBag className="w-3 h-3 text-[#94A3B8]" />
                            <span>{food.soldCount ? `${food.soldCount}+` : `${food.reviewCount * 3}+`}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-[#FF4F8B] bg-[#FFF3F7] px-2 py-0.5 rounded-lg border border-[#FFE4EE]">
                            <Ticket className="w-3 h-3 text-[#FF4F8B]" />
                            <span>{food.price.toLocaleString('vi-VN')}đ</span>
                          </div>
                          {food.originalPrice && food.originalPrice > food.price && (
                            <span className="text-[10px] text-[#94A3B8] line-through font-medium">
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* INITIAL STATE: RECENT, SUGGESTIONS (NO BACKGROUND, NO BORDER), AND 3-COLUMN "YOU MAY LIKE" FOOD GRID */
        <div className="space-y-6">
          {/* Section 1: Tìm kiếm gần đây (Recent Searches) - No card background, No card border */}
          {recentSearches.length > 0 && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-xs sm:text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#FF4F8B]" />
                  <span>Tìm kiếm gần đây</span>
                </h2>
                <button
                  type="button"
                  onClick={handleClearAllRecentSearches}
                  className="text-[11px] font-semibold text-[#94A3B8] hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa tất cả</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {recentSearches.map((item) => (
                  <div
                    key={item}
                    onClick={() => handleSelectKeyword(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#FFF3F7] text-xs font-semibold text-[#1F2937] hover:text-[#FF4F8B] cursor-pointer transition-all active:scale-95 group"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveRecentSearch(e, item)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 rounded-full"
                      title="Xóa mục này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 2: Đề xuất cho bạn (Trending Suggestions) - No card background, No card border */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-xs sm:text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#FF4F8B]" />
                <span>Đề xuất cho bạn</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {SUGGESTED_KEYWORDS.map((kw) => (
                <button
                  key={kw.text}
                  type="button"
                  onClick={() => handleSelectKeyword(kw.text)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                    kw.isHot
                      ? 'bg-[#FFF0F5] text-[#FF4F8B] hover:bg-[#FFE0EB]'
                      : 'bg-[#F1F5F9] text-[#1F2937] hover:bg-[#FFF0F5] hover:text-[#FF4F8B]'
                  }`}
                >
                  <span>{kw.icon}</span>
                  <span>{kw.text}</span>
                  {kw.isHot && <Flame className="w-3 h-3 text-[#FF4F8B] fill-[#FF4F8B]" />}
                </button>
              ))}
            </div>
          </section>

          {/* Section 3: Bạn có thể thích (3 món trên 1 hàng cuộn xuống) */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-sm sm:text-base font-bold text-[#1F2937] flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#FF4F8B] fill-[#FF4F8B]" />
                <span>Có thể bạn sẽ thích</span>
              </h2>
              <span className="text-xs text-[#64748B] font-medium">{recommendedFoods.length} món ngon</span>
            </div>

            {/* 3 Columns Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
              {recommendedFoods.map((food) => {
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
                        fromView: 'search',
                        fromParams: { search: searchQuery },
                      })
                    }
                    className="bg-white rounded-2xl p-2 sm:p-2.5 border border-[#E9DDE3] hover:border-[#FF4F8B] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer active:scale-98"
                  >
                    <div>
                      {/* Dish Image */}
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border border-[#E9DDE3]/60">
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Discount / Hot Badges */}
                        {discountPct > 0 ? (
                          <span className="absolute top-1 left-1 bg-[#06B6D4] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
                            -{discountPct}%
                          </span>
                        ) : food.isBestSeller ? (
                          <span className="absolute top-1 left-1 bg-[#FF4F8B] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
                            Hot
                          </span>
                        ) : null}
                      </div>

                      {/* Dish Name */}
                      <h3 className="font-bold text-[#1F2937] text-xs sm:text-sm leading-snug line-clamp-2 mt-1.5 group-hover:text-[#FF4F8B] transition-colors">
                        {food.name}
                      </h3>

                      {/* Rating & Sold count */}
                      <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-medium mt-1">
                        <Star className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                        <span className="text-[#1F2937] font-bold">{food.rating}</span>
                        <span className="text-[#94A3B8]">({food.soldCount || food.reviewCount * 3})</span>
                      </div>
                    </div>

                    {/* Price & Quick Add Button */}
                    <div className="mt-2 pt-1.5 border-t border-[#F1F5F9] flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        <p className="font-black text-[#FF4F8B] text-xs sm:text-sm leading-none truncate">
                          {food.price.toLocaleString('vi-VN')}đ
                        </p>
                        {food.originalPrice && food.originalPrice > food.price && (
                          <p className="text-[10px] text-[#94A3B8] line-through font-medium leading-tight truncate">
                            {food.originalPrice.toLocaleString('vi-VN')}đ
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(e, food)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#FFF3F7] hover:bg-[#FF4F8B] text-[#FF4F8B] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-90"
                        title="Thêm món"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
