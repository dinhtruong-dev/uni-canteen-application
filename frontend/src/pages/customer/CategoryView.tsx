import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FoodItem, Canteen } from '../../types';
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
  Minus,
  MapPin,
  Utensils,
  Store,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryViewProps {
  categoryId?: string;
  canteenId?: string;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ categoryId, canteenId }) => {
  const {
    foods,
    canteens,
    selectedCanteen,
    setSelectedCanteen,
    orderType,
    setOrderType,
    deliveryAddress,
    setDeliveryAddress,
    tableInfo,
    setQrScannerOpen,
    viewParams,
    navigateTo,
    addToCart,
    cart,
    updateCartQuantity,
    showToast,
    categories,
  } = useApp();

  const activeCategories = categories;

  // Determine if this is Canteen Mode (user clicked on a specific canteen)
  const incomingCanteenId =
    canteenId ||
    viewParams?.canteenId ||
    (viewParams?.canteen ? viewParams.canteen.id : null);

  const isCanteenMode = Boolean(incomingCanteenId);

  // Active canteen in Canteen Mode
  const activeCanteen: Canteen = useMemo(() => {
    if (incomingCanteenId) {
      const found = canteens.find((c) => c.id === incomingCanteenId);
      if (found) return found;
    }
    return selectedCanteen || canteens[0];
  }, [incomingCanteenId, canteens, selectedCanteen]);

  // Initial category state:
  // In Canteen Mode, default to 'ALL' so students see ALL dishes of that canteen!
  // In Category Mode, default to the chosen categoryId or first category.
  const initialCatId = isCanteenMode
    ? 'ALL'
    : categoryId ||
      viewParams?.category ||
      viewParams?.categoryId ||
      activeCategories[0]?.id ||
      'cat-1';

  const [selectedCatId, setSelectedCatId] = useState<string>(initialCatId);
  const [searchQuery, setSearchQuery] = useState<string>(viewParams?.search || '');
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>(
    isCanteenMode ? activeCanteen.id : selectedCanteen ? selectedCanteen.id : 'ALL'
  );

  // Filter bar states
  const [isPromoOnly, setIsPromoOnly] = useState<boolean>(false);
  const [pricePreset, setPricePreset] = useState<'ALL' | 'UNDER_30' | '30_50' | 'ABOVE_50'>('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'RATING'>('POPULAR');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCanteenMode) {
      setSelectedCatId('ALL');
      setSelectedCanteenId(activeCanteen.id);
    } else if (viewParams?.category) {
      setSelectedCatId(viewParams.category);
    } else if (viewParams?.categoryId) {
      setSelectedCatId(viewParams.categoryId);
    }
  }, [viewParams, isCanteenMode, activeCanteen.id]);

  const currentCategory = useMemo(() => {
    if (selectedCatId === 'ALL') {
      return { id: 'ALL', name: 'Tất cả món', image: '' };
    }
    return activeCategories.find((c) => c.id === selectedCatId) || activeCategories[0];
  }, [selectedCatId, activeCategories]);

  // Categories available in this specific canteen
  const availableCategoriesInCanteen = useMemo(() => {
    if (!isCanteenMode) return activeCategories;
    const canteenFoodCategoryIds = new Set(
      foods.filter((f) => f.canteenId === activeCanteen.id).map((f) => f.categoryId)
    );
    return activeCategories.filter((cat) => canteenFoodCategoryIds.has(cat.id));
  }, [isCanteenMode, foods, activeCanteen.id, activeCategories]);

  const totalCanteenFoodsCount = useMemo(() => {
    return foods.filter((f) => f.canteenId === activeCanteen.id).length;
  }, [foods, activeCanteen.id]);

  const handleShare = () => {
    const title = isCanteenMode ? activeCanteen.name : currentCategory.name;
    const text = isCanteenMode
      ? `Khám phá thực đơn phong phú tại ${activeCanteen.name} trên UniEat!`
      : `Khám phá các món ${currentCategory.name} siêu ngon giá sinh viên trên UniEat!`;

    if (navigator.share) {
      navigator.share({ title, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Đã sao chép liên kết!', 'success');
    }
  };

  // Filter foods
  const filteredFoods = useMemo(() => {
    let result = [...foods];

    // Canteen Mode: STRICTLY filter by active canteen first
    if (isCanteenMode) {
      result = result.filter((f) => f.canteenId === activeCanteen.id);
      // If a specific category tab is clicked in canteen mode:
      if (selectedCatId !== 'ALL') {
        result = result.filter((f) => f.categoryId === selectedCatId);
      }
    } else {
      // Regular Category Mode
      if (selectedCatId !== 'ALL') {
        result = result.filter((f) => f.categoryId === selectedCatId);
      }
      // Optional canteen selector filter in category mode
      if (selectedCanteenId !== 'ALL') {
        result = result.filter((f) => f.canteenId === selectedCanteenId);
      }
    }

    // Search query filter
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
  }, [
    foods,
    isCanteenMode,
    activeCanteen.id,
    selectedCatId,
    selectedCanteenId,
    searchQuery,
    isPromoOnly,
    pricePreset,
    sortBy,
  ]);

  const handleBack = () => {
    if (viewParams?.fromView) {
      navigateTo(viewParams.fromView, viewParams.fromParams);
    } else {
      navigateTo('home');
    }
  };

  // Group dishes by category for Canteen Mode
  const canteenFoods = foods.filter((f) => f.canteenId === activeCanteen.id);
  const canteenTotalSold = canteenFoods.reduce(
    (sum, f) => sum + (f.soldCount || f.reviewCount * 3 || 35),
    0
  );
  const categorizedGroups = activeCategories
    .map((cat) => ({
      category: cat,
      foods: canteenFoods.filter((f) => f.categoryId === cat.id),
    }))
    .filter((group) => group.foods.length > 0);

  // Catch any foods that don't match known category IDs
  const knownCatIds = new Set(activeCategories.map((c) => c.id));
  const otherCanteenFoods = canteenFoods.filter((f) => !knownCatIds.has(f.categoryId));
  if (otherCanteenFoods.length > 0) {
    categorizedGroups.push({
      category: {
        id: 'other',
        name: 'Món khác',
        description: 'Các món ăn khác',
        image: '',
        icon: 'Utensils',
        sortOrder: 999,
        isActive: true,
      },
      foods: otherCanteenFoods,
    });
  }

  // Render a food item row
  const renderFoodRow = (food: (typeof foods)[0]) => {
    const canteen = canteens.find((c) => c.id === food.canteenId);

    return (
      <div
        key={food.id}
        onClick={() =>
          navigateTo('food-detail', {
            foodId: food.id,
            food,
            fromView: 'category',
            fromParams: isCanteenMode
              ? { canteenId: activeCanteen.id, canteen: activeCanteen }
              : { category: selectedCatId },
          })
        }
        className="py-3 sm:py-4 transition-all flex items-start gap-3 sm:gap-4 group cursor-pointer"
      >
        {/* Left: Large Rounded Square Image */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-[#E9DDE3] shadow-2xs group-hover:border-[#FF4F8B] transition-all">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Right: Store & Dish Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
          <div>
            {/* Dish Title */}
            <h3 className="font-bold text-[#1F2937] text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#FF4F8B] transition-colors">
              {food.name}
              {!isCanteenMode && canteen ? ` - ${canteen.name}` : ''}
            </h3>

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

          {/* Price & Add Button Row */}
          <div className="pt-1.5 flex items-center justify-between">
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

            {/* Add Button or Inline Quantity Toggle */}
            {(() => {
              const cartItemsForFood = cart.filter((item) => item.food.id === food.id);
              const qtyInCart = cartItemsForFood.reduce((sum, item) => sum + item.quantity, 0);

              if (qtyInCart === 0) {
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        (food.sizes && food.sizes.length > 0) ||
                        (food.toppings && food.toppings.length > 0)
                      ) {
                        navigateTo('food-detail', {
                          foodId: food.id,
                          food,
                          fromView: 'category',
                          fromParams: isCanteenMode
                            ? { canteenId: activeCanteen.id, canteen: activeCanteen }
                            : { category: selectedCatId },
                        });
                      } else {
                        addToCart(food, 1);
                      }
                    }}
                    className="w-8 h-8 rounded-xl bg-[#FFF3F7] hover:bg-[#FFE4EE] text-[#FF4F8B] border border-[#FFE4EE] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                    title="Thêm vào giỏ"
                    aria-label="Thêm vào giỏ"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                );
              }

              return (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 rounded-xl bg-[#FFF3F7] border border-[#FFE4EE] flex items-center shadow-2xs shrink-0"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (cartItemsForFood.length > 0) {
                        const targetItem = cartItemsForFood[cartItemsForFood.length - 1];
                        updateCartQuantity(targetItem.id, targetItem.quantity - 1);
                      }
                    }}
                    className="w-8 h-8 rounded-xl text-[#FF4F8B] hover:bg-[#FFE4EE] active:scale-90 flex items-center justify-center font-bold cursor-pointer transition-colors shrink-0"
                    aria-label="Trừ bớt"
                    title="Trừ bớt"
                  >
                    <Minus className="w-4.5 h-4.5 stroke-[2.5]" />
                  </button>
                  <span className="min-w-5 px-1 text-center font-extrabold text-xs text-[#FF4F8B] select-none">
                    {qtyInCart}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        (food.sizes && food.sizes.length > 0) ||
                        (food.toppings && food.toppings.length > 0)
                      ) {
                        navigateTo('food-detail', {
                          foodId: food.id,
                          food,
                          fromView: 'category',
                          fromParams: isCanteenMode
                            ? { canteenId: activeCanteen.id, canteen: activeCanteen }
                            : { category: selectedCatId },
                        });
                      } else if (cartItemsForFood.length > 0) {
                        const targetItem = cartItemsForFood[cartItemsForFood.length - 1];
                        updateCartQuantity(targetItem.id, targetItem.quantity + 1);
                      } else {
                        addToCart(food, 1);
                      }
                    }}
                    className="w-8 h-8 rounded-xl text-[#FF4F8B] hover:bg-[#FFE4EE] active:scale-90 flex items-center justify-center font-bold cursor-pointer transition-colors shrink-0"
                    aria-label="Cộng thêm"
                    title="Cộng thêm"
                  >
                    <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto">
      {/* 1. Header: Back button, Title (Canteen name or Category name), Share icon */}
      <div className="sticky top-0 z-30 bg-[#FFFDFE]/95 backdrop-blur-md pt-2 pb-3 border-b border-[#E9DDE3] -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#1F2937] hover:bg-[#FFF3F7] active:scale-95 transition-all cursor-pointer"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
          </button>

          <div className="text-center px-2 flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#1F2937] truncate">
              {isCanteenMode ? activeCanteen.name : currentCategory.name}
            </h1>
            {isCanteenMode && (
              <p className="text-[11px] text-[#64748B] truncate flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3 text-[#FF4F8B] shrink-0" />
                <span>{activeCanteen.location}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#1F2937] hover:bg-[#FFF3F7] active:scale-95 transition-all cursor-pointer"
            aria-label="Chia sẻ"
            title="Chia sẻ"
          >
            <Share2 className="w-5 h-5 text-[#1F2937]" />
          </button>
        </div>
      </div>

      {/* 2. Canteen Detail Hero (Giống trang chi tiết sản phẩm) */}
      {isCanteenMode && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Hero Banner Image */}
          <div className="relative aspect-16/9 bg-slate-100 rounded-2xl overflow-hidden border border-[#E9DDE3] shadow-2xs">
            <img
              src={activeCanteen.image}
              alt={activeCanteen.name}
              className="w-full h-full object-cover"
            />
            {/* Overlay Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm ${
                  activeCanteen.isOpen ? 'bg-[#22C55E] text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {activeCanteen.isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
              </span>
              {activeCanteen.totalTables && (
                <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-lg shadow-xs">
                  {activeCanteen.totalTables} bàn tại chỗ
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
              <Clock className="w-3 h-3 text-[#FF4F8B]" /> Giờ phục vụ: {activeCanteen.openingHours}
            </div>
          </div>

          {/* Canteen Info Section */}
          <div className="px-0.5 pt-1 space-y-1.5">
            <h1 className="text-base sm:text-xl font-extrabold text-[#1F2937] leading-snug">
              {activeCanteen.name}
            </h1>

            {/* Rating & Sold count */}
            <div className="flex items-center gap-3 pt-0.5 text-xs">
              <button
                type="button"
                onClick={() =>
                  navigateTo('food-reviews', {
                    canteenId: activeCanteen.id,
                    canteen: activeCanteen,
                    isCanteen: true,
                  })
                }
                className="flex items-center gap-1 text-[#1F2937] hover:text-[#FF4F8B] transition-colors cursor-pointer group"
                title="Xem đánh giá căng tin"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span className="font-semibold text-[#1F2937]">{activeCanteen.rating}</span>
                <span className="text-[#94A3B8] font-normal text-[11px]">
                  ({activeCanteen.reviewCount})
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#FF4F8B] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1 text-[#64748B] font-normal">
                <ShoppingBag className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                <span>{canteenTotalSold > 0 ? `${canteenTotalSold}+` : '1.2k+'} đã bán</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2B. Category Mode: Search, Category Tabs, Filter & Sort */}
      {!isCanteenMode && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Tìm món ngon trong ${currentCategory.name}...`}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#E9DDE3] text-sm text-[#1F2937] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF4F8B] focus:ring-2 focus:ring-[#FF4F8B]/20 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal Category Tabs */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6"
          >
            <button
              type="button"
              onClick={() => setSelectedCatId('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCatId === 'ALL'
                  ? 'bg-[#FF4F8B] text-white shadow-2xs'
                  : 'bg-white text-[#64748B] border border-[#E9DDE3] hover:border-[#FF4F8B]/40 hover:text-[#1F2937]'
              }`}
            >
              Tất cả
            </button>
            {activeCategories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF4F8B] text-white shadow-2xs'
                      : 'bg-white text-[#64748B] border border-[#E9DDE3] hover:border-[#FF4F8B]/40 hover:text-[#1F2937]'
                  }`}
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-3.5 h-3.5 object-cover rounded-sm"
                    />
                  ) : (
                    <Utensils className="w-3 h-3" />
                  )}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Filter & Sort Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6">
            {/* Filter Modal Button */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border ${
                isPromoOnly || pricePreset !== 'ALL' || selectedCanteenId !== 'ALL'
                  ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FFE4EE]'
                  : 'bg-white text-[#64748B] border-[#E9DDE3] hover:border-[#FF4F8B]/40'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Bộ lọc</span>
              {(isPromoOnly || pricePreset !== 'ALL' || selectedCanteenId !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-[#FF4F8B]" />
              )}
            </button>

            {/* Sort Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap bg-white text-[#64748B] border border-[#E9DDE3] hover:border-[#FF4F8B]/40 transition-all cursor-pointer"
              >
                <span>
                  {sortBy === 'POPULAR'
                    ? 'Phổ biến nhất'
                    : sortBy === 'PRICE_LOW'
                    ? 'Giá: Thấp → Cao'
                    : sortBy === 'PRICE_HIGH'
                    ? 'Giá: Cao → Thấp'
                    : 'Đánh giá cao'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              {/* Sort Menu Popup */}
              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1.5 z-50 w-44 bg-white rounded-2xl border border-[#E9DDE3] shadow-lg py-1.5 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy('POPULAR');
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left font-medium hover:bg-[#FFF3F7] transition-colors ${
                        sortBy === 'POPULAR' ? 'text-[#FF4F8B] font-bold bg-[#FFF3F7]' : 'text-[#1F2937]'
                      }`}
                    >
                      Phổ biến nhất
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy('PRICE_LOW');
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left font-medium hover:bg-[#FFF3F7] transition-colors ${
                        sortBy === 'PRICE_LOW' ? 'text-[#FF4F8B] font-bold bg-[#FFF3F7]' : 'text-[#1F2937]'
                      }`}
                    >
                      Giá: Thấp đến cao
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy('PRICE_HIGH');
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left font-medium hover:bg-[#FFF3F7] transition-colors ${
                        sortBy === 'PRICE_HIGH' ? 'text-[#FF4F8B] font-bold bg-[#FFF3F7]' : 'text-[#1F2937]'
                      }`}
                    >
                      Giá: Cao đến thấp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy('RATING');
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left font-medium hover:bg-[#FFF3F7] transition-colors ${
                        sortBy === 'RATING' ? 'text-[#FF4F8B] font-bold bg-[#FFF3F7]' : 'text-[#1F2937]'
                      }`}
                    >
                      Đánh giá cao nhất
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Promo Pill */}
            <button
              type="button"
              onClick={() => setIsPromoOnly((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer border ${
                isPromoOnly
                  ? 'bg-[#FF4F8B] text-white border-[#FF4F8B] shadow-2xs'
                  : 'bg-white text-[#64748B] border-[#E9DDE3] hover:border-[#FF4F8B]/40'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>Khuyến mại</span>
            </button>

            {/* Price Under 30k Pill */}
            <button
              type="button"
              onClick={() =>
                setPricePreset((prev) => (prev === 'UNDER_30' ? 'ALL' : 'UNDER_30'))
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                pricePreset === 'UNDER_30'
                  ? 'bg-[#FF4F8B] text-white border-[#FF4F8B] shadow-2xs'
                  : 'bg-white text-[#64748B] border-[#E9DDE3] hover:border-[#FF4F8B]/40'
              }`}
            >
              Dưới 30k
            </button>

            {/* Canteen Selector Pill */}
            <select
              value={selectedCanteenId}
              onChange={(e) => setSelectedCanteenId(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border cursor-pointer focus:outline-none transition-all ${
                selectedCanteenId !== 'ALL'
                  ? 'text-[#FF4F8B] border-[#FFE4EE] bg-[#FFF3F7]'
                  : 'text-[#64748B] border-[#E9DDE3]'
              }`}
            >
              <option value="ALL">Tất cả căng tin</option>
              {canteens.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Results summary & Active Filters Badge */}
          <div className="flex items-center justify-between text-xs text-[#64748B] px-1 pt-1">
            <span>
              Tìm thấy <strong className="text-[#1F2937] font-semibold">{filteredFoods.length}</strong> món ngon
            </span>
            {(isPromoOnly || pricePreset !== 'ALL' || selectedCanteenId !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setIsPromoOnly(false);
                  setPricePreset('ALL');
                  setSelectedCanteenId('ALL');
                  setSearchQuery('');
                  setSortBy('POPULAR');
                }}
                className="text-[#FF4F8B] hover:underline font-medium cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Foods List divided by Categories (Chia theo loại món ăn) */}
      {isCanteenMode ? (
        <div className="space-y-6 pt-2">
          {categorizedGroups.length > 0 ? (
            categorizedGroups.map(({ category: cat, foods: groupFoods }) => (
              <div key={cat.id} className="space-y-2">
                {/* Category Group Header */}
                <div className="pt-2 pb-1 px-1 border-b border-slate-200/80">
                  <h2 className="text-sm sm:text-base uppercase font-normal text-[#1F2937] tracking-wider">
                    {cat.name}
                  </h2>
                </div>

                {/* Food Rows in this category */}
                <div className="divide-y divide-[#E9DDE3]/80">
                  {groupFoods.map((food) => renderFoodRow(food))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#FFF3F7] border border-[#FFE4EE] flex items-center justify-center mx-auto text-3xl">
                🍽️
              </div>
              <h3 className="text-base font-bold text-[#1F2937]">Chưa có món ăn nào</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Căng tin đang chuẩn bị thực đơn, vui lòng quay lại sau bạn nhé!
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Non-canteen mode: single category view */
        <div className="divide-y divide-[#E9DDE3]/80">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => renderFoodRow(food))
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#FFF3F7] border border-[#FFE4EE] flex items-center justify-center mx-auto text-3xl">
                🍽️
              </div>
              <h3 className="text-base font-bold text-[#1F2937]">Không tìm thấy món ăn nào</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Thử chọn danh mục khác để xem thêm nhiều món ngon bạn nhé!
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Advanced Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E9DDE3] pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#FF4F8B]" />
                  <h3 className="font-bold text-base sm:text-lg text-[#1F2937]">
                    Bộ lọc món ăn
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Section: Canteen */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block">
                  Căng tin phục vụ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCanteenId('ALL')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                      selectedCanteenId === 'ALL'
                        ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B]'
                        : 'bg-white text-[#64748B] border-[#E9DDE3] hover:border-[#FF4F8B]/40'
                    }`}
                  >
                    Tất cả căng tin
                  </button>
                  {canteens.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCanteenId(c.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border truncate transition-all cursor-pointer ${
                        selectedCanteenId === c.id
                          ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B]'
                          : 'bg-white text-[#64748B] border-[#E9DDE3] hover:border-[#FF4F8B]/40'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Section: Price Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block">
                  Mức giá
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'UNDER_30', label: 'Dưới 30k' },
                    { id: '30_50', label: '30k - 50k' },
                    { id: 'ABOVE_50', label: 'Trên 50k' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPricePreset(p.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                        pricePreset === p.id
                          ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B]'
                          : 'bg-white text-[#64748B] border-[#E9DDE3] hover:border-[#FF4F8B]/40'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Section: Special Promo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block">
                  Ưu đãi & Độ hot
                </label>
                <button
                  type="button"
                  onClick={() => setIsPromoOnly((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isPromoOnly
                      ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B]'
                      : 'bg-white text-[#64748B] border-[#E9DDE3] hover:border-[#FF4F8B]/40'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#FF4F8B]" />
                    <span>Chỉ hiển thị món có giảm giá / Bán chạy</span>
                  </span>
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isPromoOnly
                        ? 'bg-[#FF4F8B] border-[#FF4F8B] text-white'
                        : 'border-[#CBD5E1]'
                    }`}
                  >
                    {isPromoOnly && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </span>
                </button>
              </div>

              {/* Filter Section: Sort Order */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1F2937] uppercase tracking-wider block">
                  Sắp xếp kết quả
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'POPULAR', label: 'Phổ biến nhất' },
                    { id: 'PRICE_LOW', label: 'Giá thấp → cao' },
                    { id: 'PRICE_HIGH', label: 'Giá cao → thấp' },
                    { id: 'RATING', label: 'Đánh giá cao nhất' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSortBy(s.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                        sortBy === s.id
                          ? 'bg-[#FFF3F7] text-[#FF4F8B] border-[#FF4F8B]'
                          : 'bg-white text-[#64748B] border-[#E9DDE3] hover:border-[#FF4F8B]/40'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#E9DDE3]">
                <button
                  type="button"
                  onClick={() => {
                    setIsPromoOnly(false);
                    setPricePreset('ALL');
                    setSelectedCanteenId('ALL');
                    setSortBy('POPULAR');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#E9DDE3] text-xs font-bold text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Thiết lập lại
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF4F8B] hover:bg-[#FF357A] text-white text-xs font-bold shadow-md shadow-[#FF4F8B]/20 transition-all cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
