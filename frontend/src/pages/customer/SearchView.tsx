import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodItem } from '../../types';
import {
  ArrowLeft,
  Search,
  X,
  Clock,
  Trash2,
  TrendingUp,
  Star,
  ShoppingBag,
  Ticket,
  BadgeCheck,
  Package,
  ArrowRight,
  Flame,
  Utensils,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Check,
  RotateCw,
} from 'lucide-react';
import { HorizontalScrollContainer } from '../../components/HorizontalScrollContainer';
import { searchService, CanteenSearchItem, SearchResponse } from '../../services/api';

const RECENT_SEARCHES_KEY = 'unieat_recent_searches';
const DEFAULT_RECENT_SEARCHES = [
  'Trà sữa',
  'Matcha Vibe',
  'Cơm tấm sườn',
  'Bánh mì Doner Kebab',
  'Trà đào cam sả',
];

const SUGGESTED_KEYWORDS = [
  { text: 'Trà sữa', icon: '🧋', isHot: true },
  { text: 'Matcha Latte 26K', icon: '🍵', isHot: true },
  { text: 'Cơm tấm sườn bì chả', icon: '🍛' },
  { text: 'Bánh mì thịt nướng', icon: '🥪', isHot: true },
  { text: 'Phở bò tái nạm', icon: '🍜' },
  { text: 'Bún chả Hà Nội', icon: '🥘' },
  { text: 'Gà rán giòn rụm', icon: '🍗' },
  { text: 'Cà phê sữa đá', icon: '☕' },
];

const QUICK_CATEGORIES = [
  { id: 'com', label: 'Cơm SV', query: 'Cơm', icon: '🍛', color: 'from-emerald-100 to-teal-100' },
  { id: 'bun-pho', label: 'Bún Phở', query: 'Bún', icon: '🍜', color: 'from-yellow-100 to-amber-100' },
  { id: 'tra-sua', label: 'Trà Sữa', query: 'Trà sữa', icon: '🧋', color: 'from-amber-100 to-orange-100' },
  { id: 'ca-phe', label: 'Cà Phê', query: 'Cà phê', icon: '☕', color: 'from-orange-100 to-amber-200' },
  { id: 'an-vat', label: 'Bánh Mì', query: 'Bánh mì', icon: '🥪', color: 'from-red-100 to-orange-100' },
  { id: 'trang-mieng', label: 'Chè & Flan', query: 'Chè', icon: '🍧', color: 'from-pink-100 to-rose-100' },
  { id: 'mon-chay', label: 'Món Chay', query: 'Chay', icon: '🥗', color: 'from-green-100 to-emerald-100' },
  { id: 'diem-tam', label: 'Xôi Bánh', query: 'Xôi', icon: '🥟', color: 'from-violet-100 to-purple-100' },
  { id: 'lau-nuong', label: 'Lẩu & Nướng', query: 'Lẩu', icon: '🍲', color: 'from-red-100 to-rose-200' },
  { id: 'eat-clean', label: 'Eat Clean', query: 'Salad', icon: '🥑', color: 'from-teal-100 to-cyan-100' },
];

export const SearchView: React.FC = () => {
  const { foods, canteens, viewParams, navigateTo, setSelectedCanteen } = useApp();

  // Search input & parameters
  const [searchQuery, setSearchQuery] = useState<string>(viewParams?.search || '');
  const [activeSort, setActiveSort] = useState<'popular' | 'rating' | 'price_asc' | 'price_desc'>('popular');
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [promoOnly, setPromoOnly] = useState<boolean>(false);
  const [under30k, setUnder30k] = useState<boolean>(false);
  const [freeshipOnly, setFreeshipOnly] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Pagination state (Page from backend)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const LIMIT_PER_PAGE = 3; // 3 Canteens per page

  // Backend response & Loading state
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic Search History loaded from Backend API
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isRefreshingHistory, setIsRefreshingHistory] = useState<boolean>(false);

  const loadHistoryFromBackend = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshingHistory(true);
    } else {
      setIsLoadingHistory(true);
    }
    try {
      const historyData = await searchService.getSearchHistory('user-guest');
      setRecentSearches(historyData);
    } catch (err) {
      console.warn('Failed to fetch search history from backend:', err);
    } finally {
      setIsLoadingHistory(false);
      setIsRefreshingHistory(false);
    }
  };

  useEffect(() => {
    loadHistoryFromBackend();
  }, []);

  const handleAddRecentSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      const updated = await searchService.addSearchHistory(trimmed, 'user-guest');
      if (updated && updated.length > 0) {
        setRecentSearches(updated);
      } else {
        setRecentSearches((prev) => [trimmed, ...prev.filter((i) => i.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10));
      }
    } catch (err) {
      console.warn('Failed to add search history to backend:', err);
      setRecentSearches((prev) => [trimmed, ...prev.filter((i) => i.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10));
    }
  };

  const handleRemoveRecentSearch = async (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    // Optimistic UI update
    setRecentSearches((prev) => prev.filter((item) => item !== itemToRemove));
    try {
      const updated = await searchService.removeSearchHistory(itemToRemove, 'user-guest');
      if (updated) {
        setRecentSearches(updated);
      }
    } catch (err) {
      console.warn('Failed to remove search history from backend:', err);
    }
  };

  const handleClearAllRecentSearches = async () => {
    setRecentSearches([]);
    try {
      await searchService.clearSearchHistory('user-guest');
    } catch (err) {
      console.warn('Failed to clear search history from backend:', err);
    }
  };

  // FETCH SEARCH DATA FROM BACKEND API
  const fetchSearchResults = async (
    query: string,
    page: number = 1,
    sort: 'popular' | 'rating' | 'price_asc' | 'price_desc' = activeSort,
    promo: boolean = promoOnly,
    u30: boolean = under30k
  ) => {
    setIsLoading(true);
    try {
      const res = await searchService.search({
        q: query,
        page,
        limit: LIMIT_PER_PAGE,
        sortBy: sort,
        promoOnly: promo,
        under30k: u30,
        categoryId: selectedCategory || undefined,
      });

      // If backend returns data
      if (res && res.data) {
        setSearchResponse(res);
      }
    } catch (err) {
      console.error('[Search] Error loading search results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger search on query / filter / page changes
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed && !selectedCategory) {
      setSearchResponse(null);
      setIsLoading(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      fetchSearchResults(trimmed, currentPage, activeSort, promoOnly, under30k);
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, currentPage, activeSort, promoOnly, under30k, selectedCategory]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      handleAddRecentSearch(searchQuery);
      setCurrentPage(1);
      fetchSearchResults(searchQuery.trim(), 1, activeSort, promoOnly, under30k);
    }
  };

  const handleSelectKeyword = (keyword: string) => {
    setSearchQuery(keyword);
    handleAddRecentSearch(keyword);
    setCurrentPage(1);
  };

  const handleSelectCategory = (cat: typeof QUICK_CATEGORIES[0]) => {
    if (searchQuery.toLowerCase() === cat.query.toLowerCase()) {
      // Toggle off
      setSearchQuery('');
      setSelectedCategory(null);
    } else {
      setSearchQuery(cat.query);
      handleAddRecentSearch(cat.query);
      setCurrentPage(1);
    }
  };

  const formatVND = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Helper tính voucher tag như ảnh mẫu
  const getVoucherTag = (food: FoodItem) => {
    if (food.originalPrice && food.originalPrice > food.price) {
      const pct = Math.round((1 - food.price / food.originalPrice) * 100);
      return `${pct}%`;
    }
    const vouchers = ['40k', '30%', '60k', '25k', '50k', '199k'];
    const charCodeSum = food.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return vouchers[charCodeSum % vouchers.length];
  };

  // Featured restaurants/foods for the initial discovery horizontal scroll
  const topRecommendations = useMemo(() => {
    return foods.slice(0, 8);
  }, [foods]);

  // Món đã đặt gần đây (mô phỏng theo Cơm Tấm Sườn Đông Dương trong ảnh mẫu)
  const recentOrderFood = foods.find((f) => f.name.toLowerCase().includes('cơm')) || foods[0];

  const sortLabels = {
    popular: 'Phổ biến',
    rating: 'Đánh giá cao',
    price_asc: 'Giá tăng dần',
    price_desc: 'Giá giảm dần',
  };

  const isSearchActive = Boolean(searchQuery.trim() || selectedCategory);

  return (
    <div className="max-w-2xl mx-auto space-y-3.5 pb-24 px-1 sm:px-0">
      {/* 1. HEADER TÌM KIẾM CHUẨN SHOPEEFOOD: Nút quay lại ← và Ô tìm kiếm Pill bo tròn toàn phần */}
      <div
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-[#E9DDE3]/80 shadow-xs'
            : 'pt-1 pb-1 bg-transparent'
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 sm:gap-3">
          {/* Nút quay lại trang chủ ← */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="w-10 h-10 rounded-full bg-white border border-[#E9DDE3] flex items-center justify-center text-[#1F2937] hover:bg-[#FFF3F7] active:scale-95 transition-all cursor-pointer shrink-0 shadow-2xs"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
          </button>

          {/* Ô tìm kiếm dạng Pill */}
          <div className="relative flex-1 flex items-center bg-[#F1F5F9]/95 rounded-full border border-transparent focus-within:border-[#FF4F8B] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF4F8B]/20 transition-all min-h-[44px] sm:min-h-[48px] shadow-2xs">
            <Search className="w-4.5 h-4.5 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Matcha Vibe - Matcha Latte Từ 26K"
              className="w-full pl-11 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#1F2937] placeholder-[#94A3B8] bg-transparent focus:outline-none"
            />

            {/* Nút xóa nhanh text */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setCurrentPage(1);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                title="Xóa chữ"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* 2. THANH BỘ LỌC CHIPS (Theo đúng chuẩn ảnh ShopeeFood của user) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 pb-1">
          {/* Nút Icon Bộ Lọc */}
          <button
            type="button"
            onClick={() => {
              setPromoOnly(false);
              setUnder30k(false);
              setFreeshipOnly(false);
              setActiveSort('popular');
            }}
            className="w-8 h-8 rounded-xl bg-white border border-[#E9DDE3] flex items-center justify-center text-[#64748B] hover:text-[#1F2937] hover:border-[#FF4F8B] transition-colors shrink-0 shadow-2xs cursor-pointer"
            title="Đặt lại bộ lọc"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Sắp xếp Dropdown */}
          <div className="relative shrink-0" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                activeSort !== 'popular'
                  ? 'bg-[#FF4F8B] text-white border-[#FF4F8B]'
                  : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#FF4F8B]'
              }`}
            >
              <span>Sắp xếp: {sortLabels[activeSort]}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-2xl shadow-lg border border-[#E9DDE3] p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                {(['popular', 'rating', 'price_asc', 'price_desc'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setActiveSort(s);
                      setIsSortOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl text-left cursor-pointer transition-colors ${
                      activeSort === s
                        ? 'bg-[#FFF0F5] text-[#FF4F8B]'
                        : 'text-[#1F2937] hover:bg-slate-50'
                    }`}
                  >
                    <span>{sortLabels[s]}</span>
                    {activeSort === s && <Check className="w-3.5 h-3.5 text-[#FF4F8B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chip Khuyến Mại */}
          <button
            type="button"
            onClick={() => {
              setPromoOnly(!promoOnly);
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs border ${
              promoOnly
                ? 'bg-[#FF4F8B] text-white border-[#FF4F8B]'
                : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#FF4F8B]'
            }`}
          >
            <span>🎟️ Khuyến mại</span>
          </button>

          {/* Chip Dưới 30k */}
          <button
            type="button"
            onClick={() => {
              setUnder30k(!under30k);
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs border ${
              under30k
                ? 'bg-[#FF4F8B] text-white border-[#FF4F8B]'
                : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#FF4F8B]'
            }`}
          >
            <span>⚡ Dưới 30k</span>
          </button>

          {/* Chip Freeship */}
          <button
            type="button"
            onClick={() => {
              setFreeshipOnly(!freeshipOnly);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs border ${
              freeshipOnly
                ? 'bg-[#00BFA5] text-white border-[#00BFA5]'
                : 'bg-white text-[#1F2937] border-[#E9DDE3] hover:border-[#00BFA5]'
            }`}
          >
            <span>📦 Freeship</span>
          </button>
        </div>

        {/* 3. HÀNG ICON DANH MỤC NHANH (Theo đúng hàng icon Đồ Uống, Đồ Ngọt, Bún Phở, Ăn vặt, Cơm trong ảnh) */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pt-2 pb-1">
          {QUICK_CATEGORIES.map((cat) => {
            const isCatActive = searchQuery.toLowerCase().includes(cat.query.toLowerCase());
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`flex flex-col items-center gap-1 min-w-[62px] p-1.5 rounded-2xl transition-all cursor-pointer active:scale-95 ${
                  isCatActive ? 'bg-[#FFF0F5] scale-105' : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-2xs border transition-transform ${
                    isCatActive
                      ? 'border-[#FF4F8B] bg-linear-to-b from-[#FFF0F5] to-[#FFE0EB]'
                      : 'border-[#E9DDE3] bg-linear-to-b from-slate-50 to-slate-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                </div>
                <span
                  className={`text-[11px] font-bold text-center truncate w-full ${
                    isCatActive ? 'text-[#FF4F8B]' : 'text-[#1F2937]'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. HIỂN THỊ KẾT QUẢ TÌM KIẾM THEO 3 CĂNG TIN (CÓ LOAD TỪ BACKEND & PHÂN TRANG) */}
      {isSearchActive ? (
        <div className="space-y-4 pt-1">
          {/* Thông tin tìm kiếm & trạng thái loading */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-[#64748B]">
                Kết quả cho: <span className="text-[#FF4F8B] font-extrabold">"{searchQuery}"</span>
              </p>
              {isLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF4F8B] bg-[#FFF0F5] px-2 py-0.5 rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Đang tải từ 3 căng tin...</span>
                </span>
              )}
            </div>

            {searchResponse && !isLoading && (
              <span className="text-xs text-[#94A3B8] font-medium">
                {searchResponse.totalMatches} món • {searchResponse.totalCanteens} căng tin
              </span>
            )}
          </div>

          {/* TRẠNG THÁI 1: ĐANG LOAD BACKEND (Skeleton Loading hiệu ứng ShopeeFood) */}
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((sk) => (
                <div key={sk} className="bg-white rounded-3xl p-4 border border-[#E9DDE3] shadow-2xs space-y-3">
                  {/* Header quán Skeleton */}
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="flex gap-2">
                        <div className="h-5 bg-slate-100 rounded w-16" />
                        <div className="h-5 bg-slate-100 rounded w-20" />
                      </div>
                    </div>
                  </div>
                  {/* Hàng món ăn ngang Skeleton */}
                  <div className="grid grid-flow-col auto-cols-[135px] sm:auto-cols-[150px] gap-3 overflow-hidden pt-2">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="space-y-2">
                        <div className="aspect-square rounded-2xl bg-slate-200" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : searchResponse && searchResponse.data.length > 0 ? (
            /* TRẠNG THÁI 2: ĐÃ CÓ KẾT QUẢ TỪ BACKEND - HIỆN THỊ CHUẨN 3 CĂNG TIN NHƯ ẢNH MẪU */
            <div className="space-y-4">
              {searchResponse.data.map((item: CanteenSearchItem) => {
                const canteenInfo = item.canteen;
                const matchingFoods = item.foods;

                return (
                  <div
                    key={canteenInfo.id}
                    className="bg-white rounded-3xl p-3.5 sm:p-4 border border-[#E9DDE3] shadow-2xs hover:shadow-xs transition-all space-y-3"
                  >
                    {/* KHỐI 1: THÔNG TIN CĂNG TIN (Căng Tin A, B hoặc C) */}
                    <div
                      onClick={() => {
                        const targetCanteen = canteens.find((c) => c.id === canteenInfo.id) || canteens[0];
                        setSelectedCanteen(targetCanteen);
                        navigateTo('canteen-menu', { canteenId: canteenInfo.id });
                      }}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      {/* Logo / Ảnh đại diện Căng tin */}
                      <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-[#E9DDE3] shadow-2xs">
                        <img
                          src={canteenInfo.image}
                          alt={canteenInfo.displayName || canteenInfo.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Tên & Thống kê Căng tin */}
                      <div className="flex-1 min-w-0">
                        {/* Tên kèm huy hiệu xác minh xanh ngọc */}
                        <div className="flex items-center gap-1.5">
                          <BadgeCheck className="w-4 h-4 text-[#00BFA5] fill-[#00BFA5] text-white shrink-0" />
                          <h3 className="font-bold text-sm sm:text-base text-[#1F2937] group-hover:text-[#FF4F8B] transition-colors truncate">
                            {canteenInfo.displayName || canteenInfo.name}
                          </h3>
                        </div>

                        {/* Điểm đánh giá, lượt bán, thời gian giao */}
                        <div className="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs text-[#64748B] mt-0.5 font-medium flex-wrap">
                          <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{canteenInfo.rating}</span>
                            <span className="text-[#94A3B8] font-normal text-[10px]">({canteenInfo.reviewCount})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3 text-[#FF5722]" />
                            <span>{canteenInfo.soldCount || '1.7K+'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{canteenInfo.duration || '11 phút'}</span>
                          </div>
                        </div>

                        {/* Badges Voucher & Freeship đúng chuẩn màu trong ảnh */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#FF5722] bg-[#FFF5F2] border border-[#FF5722]/40 px-2 py-0.5 rounded-md leading-tight">
                            <Ticket className="w-3 h-3 text-[#FF5722] shrink-0" />
                            <span>{canteenInfo.voucher || '120.000đ'}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#009688] bg-[#E0F7F4] border border-[#00BFA5]/40 px-2 py-0.5 rounded-md leading-tight">
                            <Package className="w-3 h-3 text-[#00BFA5] shrink-0" />
                            <span>{canteenInfo.freeship || 'Freeship 10.000đ'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* KHỐI 2: HÀNG CUỘN NGANG CÁC MÓN TƯƠNG ỨNG VỚI TỪ KHÓA TÌM KIẾM */}
                    <div className="pt-1">
                      <HorizontalScrollContainer className="grid grid-flow-col auto-cols-[130px] sm:auto-cols-[150px] gap-3 py-1 px-0.5">
                        {matchingFoods.map((food) => (
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
                            className="bg-transparent group/item flex flex-col h-full cursor-pointer select-none transition-all w-full"
                          >
                            {/* Hình ảnh món ăn bo góc cao cấp */}
                            <div className="relative aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden border border-[#E9DDE3] shadow-2xs group-hover/item:border-[#FF4F8B] transition-all">
                              <img
                                src={food.image}
                                alt={food.name}
                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Giá tiền nổi bật màu Xanh Cyan/Blue + Tên món bên dưới */}
                            <div className="pt-2 px-0.5 flex flex-col">
                              <span className="text-[13px] sm:text-sm font-black text-[#0088D6] leading-tight">
                                {formatVND(food.price)}
                              </span>
                              <p className="text-xs font-semibold text-[#1F2937] group-hover/item:text-[#FF4F8B] transition-colors line-clamp-2 mt-0.5 leading-snug">
                                {food.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </HorizontalScrollContainer>
                    </div>

                    {/* KHỐI 3: LINK "Xem thêm X món >" như ảnh mẫu */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          const targetCanteen = canteens.find((c) => c.id === canteenInfo.id) || canteens[0];
                          setSelectedCanteen(targetCanteen);
                          navigateTo('canteen-menu', { canteenId: canteenInfo.id });
                        }}
                        className="text-xs font-bold text-[#64748B] hover:text-[#FF4F8B] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Xem thêm thực đơn {canteenInfo.code || canteenInfo.displayName}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[11px] text-[#94A3B8]">
                        {matchingFoods.length} món phù hợp
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* 5. PHÂN TRANG (PAGINATION) BACKEND NHƯ YÊU CẦU: "serch cx có page kiểu vậy ấy" */}
              {searchResponse.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-3 pb-2">
                  {/* Nút Trước */}
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-2 rounded-xl border border-[#E9DDE3] bg-white text-xs font-bold text-[#1F2937] hover:bg-[#FFF3F7] hover:border-[#FF4F8B] disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs transition-all"
                  >
                    ← Trang trước
                  </button>

                  {/* Danh sách các số trang */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: searchResponse.totalPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      const isActive = pNum === currentPage;
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#FF4F8B] text-white shadow-xs'
                              : 'bg-white text-[#1F2937] border border-[#E9DDE3] hover:border-[#FF4F8B]'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Nút Sau */}
                  <button
                    type="button"
                    disabled={currentPage >= searchResponse.totalPages}
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(searchResponse.totalPages, prev + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-2 rounded-xl border border-[#E9DDE3] bg-white text-xs font-bold text-[#1F2937] hover:bg-[#FFF3F7] hover:border-[#FF4F8B] disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs transition-all"
                  >
                    Trang sau →
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TRƯỜNG HỢP KHÔNG TÌM THẤY MÓN */
            <div className="bg-white rounded-3xl p-8 border border-[#E9DDE3] text-center space-y-3 shadow-2xs">
              <Utensils className="w-10 h-10 text-[#94A3B8] mx-auto opacity-60" />
              <div>
                <p className="text-sm font-bold text-[#1F2937]">Không tìm thấy món ăn phù hợp tại các căng tin</p>
                <p className="text-xs text-[#64748B] mt-1">Hãy thử tìm với từ khóa khác hoặc bấm gợi ý bên dưới</p>
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
          )}
        </div>
      ) : (
        /* GIAO DIỆN MẪU KHÁM PHÁ BAN ĐẦU ("dữ nguyên cái giao diện search như cũ") */
        <div className="space-y-6">
          {/* PHẦN 1: HÀNG QUÁN GỢI Ý NGANG */}
          <section className="space-y-1">
            <HorizontalScrollContainer className="grid grid-flow-col auto-cols-[145px] sm:auto-cols-[170px] gap-3 sm:gap-3.5 py-1 px-0.5">
              {topRecommendations.map((food) => {
                const voucherText = getVoucherTag(food);
                const reviewCount = food.reviewCount || 36;
                const soldCountText = food.soldCount ? `${food.soldCount}+` : '1K+';

                return (
                  <div
                    key={food.id}
                    onClick={() =>
                      navigateTo('food-detail', {
                        foodId: food.id,
                        food,
                        fromView: 'search',
                      })
                    }
                    className="bg-transparent group flex flex-col h-full cursor-pointer select-none transition-all w-full"
                  >
                    <div className="relative aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden border border-[#E9DDE3] shadow-2xs group-hover:shadow-md group-hover:border-[#FF4F8B] transition-all">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="pt-2 px-0.5 flex-1 flex flex-col justify-between gap-1">
                      <div className="space-y-1">
                        <div className="flex items-start gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-[#00BFA5] fill-[#00BFA5] text-white shrink-0 mt-0.5" />
                          <h3 className="font-bold text-[#1F2937] text-xs sm:text-[13px] group-hover:text-[#FF4F8B] transition-colors line-clamp-2 leading-snug">
                            {food.canteenName ? `${food.canteenName} - ` : ''}{food.name}
                          </h3>
                        </div>

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
              })}
            </HorizontalScrollContainer>
          </section>

          {/* PHẦN 2: "🕒 Đã đặt gần đây" */}
          {recentOrderFood && (
            <section className="space-y-2.5">
              <h2 className="text-sm sm:text-base font-bold text-[#1F2937] flex items-center gap-1.5 px-0.5">
                <Clock className="w-4 h-4 text-[#64748B]" />
                <span>Đã đặt gần đây</span>
              </h2>

              <div
                onClick={() =>
                  navigateTo('food-detail', {
                    foodId: recentOrderFood.id,
                    food: recentOrderFood,
                    fromView: 'search',
                  })
                }
                className="bg-white rounded-3xl p-3.5 sm:p-4 border border-[#E9DDE3] hover:border-[#FF4F8B] shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-[#00BFA5] fill-[#00BFA5] text-white shrink-0 mt-0.5" />
                    <h3 className="font-bold text-[#1F2937] text-xs sm:text-sm group-hover:text-[#FF4F8B] transition-colors line-clamp-2 leading-snug">
                      {recentOrderFood.canteenName ? `${recentOrderFood.canteenName} - ` : ''}
                      {recentOrderFood.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5 text-[11px] font-medium">
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{recentOrderFood.rating || 4.7}</span>
                      <span className="text-[#94A3B8] font-normal text-[10px]">({recentOrderFood.reviewCount || 42})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#64748B] shrink-0">
                      <ShoppingBag className="w-3 h-3 text-[#FF5722]" />
                      <span className="text-[#64748B] text-[10px] font-medium">1.2K+</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#FF5722] bg-[#FFF5F2] border border-[#FF5722]/30 px-1.5 py-0.5 rounded leading-tight">
                      <Ticket className="w-2.5 h-2.5 text-[#FF5722] shrink-0" />
                      <span>199k</span>
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#009688] bg-[#E0F7F4] border border-[#00BFA5]/30 px-1.5 py-0.5 rounded leading-tight">
                      <Package className="w-2.5 h-2.5 text-[#00BFA5] shrink-0" />
                      <span>Freeship</span>
                    </span>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-[#1F2937] hover:bg-black text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-2xs cursor-pointer"
                      title="Xem lại món"
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-[#E9DDE3] shadow-2xs">
                  <img
                    src={recentOrderFood.image}
                    alt={recentOrderFood.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </section>
          )}

          {/* PHẦN 3: "🧑‍🤝‍🧑 Quán Mới Bạn Mới - Voucher Khao Ngay 50%" */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#1F2937] flex items-center gap-1.5">
                  <span>🧑‍🤝‍🧑</span>
                  <span>Quán Mới Bạn Mới</span>
                </h2>
                <p className="text-xs font-bold text-[#FF4F8B] -mt-0.5">Voucher Khao Ngay 50%</p>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('section-list', { filterType: 'NEW', title: 'Quán Mới Bạn Mới' })}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#FFF3F7] flex items-center justify-center text-[#1F2937] hover:text-[#FF4F8B] transition-colors cursor-pointer"
                title="Xem thêm quán mới"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <HorizontalScrollContainer className="grid grid-flow-col auto-cols-[160px] sm:auto-cols-[180px] gap-3 py-1 px-0.5">
              {/* Banner 1: BING BING */}
              <div
                onClick={() => handleSelectKeyword('Trà sữa')}
                className="bg-linear-to-br from-[#FF1E40] to-[#E60026] text-white rounded-3xl p-3.5 flex flex-col justify-between aspect-square cursor-pointer shadow-xs hover:shadow-md transition-all group"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80">CRAZY TOPPING • CRAZY HAPPINESS</span>
                <div className="my-auto text-center">
                  <h3 className="font-black text-2xl tracking-tighter drop-shadow-sm group-hover:scale-105 transition-transform">
                    BING BING
                  </h3>
                  <p className="text-[10px] font-bold text-white/90">KOREAN DESSERT CLUB</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-extrabold bg-white/20 px-2 py-1 rounded-xl backdrop-blur-xs">
                  <span>Giảm 50%</span>
                  <span>Hot ✨</span>
                </div>
              </div>

              {/* Banner 2: HiMC */}
              <div
                onClick={() => handleSelectKeyword('Cơm sườn')}
                className="bg-linear-to-br from-[#E61F24] to-[#C90D12] text-white rounded-3xl p-3.5 flex flex-col justify-between aspect-square cursor-pointer shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-white/80">Cơm Sườn Cay Điii</span>
                  <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                </div>
                <div className="my-auto text-center">
                  <h3 className="font-black text-3xl tracking-tighter drop-shadow-sm group-hover:scale-105 transition-transform">
                    HiMC
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-black bg-[#00BFA5] text-white px-1.5 py-0.5 rounded">
                    10%
                  </span>
                  <span className="text-[9px] font-black bg-[#00BFA5] text-white px-1.5 py-0.5 rounded">
                    30%
                  </span>
                </div>
              </div>

              {/* Banner 3: Tiệc Vui Đơn Nhóm */}
              <div
                onClick={() => handleSelectKeyword('Bánh mì')}
                className="bg-linear-to-br from-[#06B6D4] to-[#0284C7] text-white rounded-3xl p-3.5 flex flex-col justify-between aspect-square cursor-pointer shadow-xs hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="z-10">
                  <span className="text-[9px] font-black bg-yellow-400 text-slate-900 px-1.5 py-0.5 rounded">
                    TIỆC VUI
                  </span>
                  <h3 className="font-black text-base mt-1 leading-tight">
                    ĐƠN NHÓM
                  </h3>
                  <p className="text-[11px] font-extrabold text-yellow-300">
                    GIẢM THÊM 10%
                  </p>
                  <p className="text-[9px] font-bold text-white/90">
                    + FREESHIP
                  </p>
                </div>
                <span className="text-[10px] font-bold text-white/80 z-10 flex items-center gap-1">
                  Khám phá ngay <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </HorizontalScrollContainer>
          </section>

          {/* PHẦN 4: Tìm kiếm gần đây (Tải động từ API Backend với hiệu ứng Loading) */}
          {(isLoadingHistory || recentSearches.length > 0) && (
            <section className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF4F8B]" />
                    <span>Tìm kiếm gần đây</span>
                  </h2>
                  {isLoadingHistory ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF4F8B] bg-[#FFF0F5] px-2 py-0.5 rounded-full border border-[#FF4F8B]/20 animate-pulse">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      <span>Đang tải từ API...</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      (Backend API)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadHistoryFromBackend(true)}
                    disabled={isRefreshingHistory || isLoadingHistory}
                    className="p-1 text-slate-400 hover:text-[#FF4F8B] rounded-full hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
                    title="Tải lại lịch sử từ server"
                  >
                    <RotateCw className={`w-3 h-3 ${isRefreshingHistory ? 'animate-spin text-[#FF4F8B]' : ''}`} />
                  </button>

                  {!isLoadingHistory && recentSearches.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllRecentSearches}
                      className="text-[11px] font-semibold text-[#94A3B8] hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              </div>

              {isLoadingHistory ? (
                /* Skeleton tags loader mô phỏng quá trình tải dữ liệu từ API */
                <div className="flex flex-wrap gap-1.5">
                  <div className="h-7 w-28 bg-slate-200/80 rounded-full animate-pulse" />
                  <div className="h-7 w-36 bg-slate-200/80 rounded-full animate-pulse" />
                  <div className="h-7 w-24 bg-slate-200/80 rounded-full animate-pulse" />
                  <div className="h-7 w-32 bg-slate-200/80 rounded-full animate-pulse" />
                  <div className="h-7 w-20 bg-slate-200/80 rounded-full animate-pulse" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((item) => (
                    <div
                      key={item}
                      onClick={() => handleSelectKeyword(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#FFF3F7] text-xs font-semibold text-[#1F2937] hover:text-[#FF4F8B] cursor-pointer transition-all active:scale-95 group border border-slate-200/50"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveRecentSearch(e, item)}
                        className="text-slate-400 hover:text-rose-500 p-0.5 rounded-full cursor-pointer"
                        title="Xóa"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* PHẦN 5: Gợi ý cho bạn */}
          <section className="space-y-2 pt-1">
            <h2 className="text-xs sm:text-sm font-bold text-[#1F2937] flex items-center gap-1.5 px-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF4F8B]" />
              <span>Gợi ý cho bạn</span>
            </h2>

            <div className="flex flex-wrap gap-1.5">
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
        </div>
      )}
    </div>
  );
};
