import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodTopping, FoodSize } from '../types';
import {
  ArrowLeft,
  Star,
  Minus,
  Plus,
  ShoppingBag,
  Clock,
  Check,
  Flame,
  Leaf,
  Heart,
  Share2,
  Utensils,
  MapPin,
  ChevronRight
} from 'lucide-react';

interface FoodDetailViewProps {
  foodId?: string;
}

export const FoodDetailView: React.FC<FoodDetailViewProps> = ({ foodId }) => {
  const {
    foods,
    viewParams,
    addToCart,
    updateCartQuantity,
    toggleFavorite,
    isFavorite,
    navigateTo,
    canteens,
    showToast,
    cart,
    currentUser,
  } = useApp();

  // Retrieve foodId either from props or viewParams
  const activeFoodId = foodId || viewParams?.foodId || viewParams?.food?.id;
  const food = foods.find((f) => f.id === activeFoodId) || viewParams?.food || foods[0];

  if (!food) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <p className="text-slate-500 font-bold text-sm">Không tìm thấy món ăn này.</p>
        <button
          onClick={() => navigateTo('menu')}
          className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs"
        >
          Quay lại Thực đơn
        </button>
      </div>
    );
  }

  const favorite = isFavorite(food.id);
  const canteen = canteens.find((c) => c.id === food.canteenId);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<FoodSize | undefined>(
    food.sizes && food.sizes.length > 0 ? food.sizes[0] : undefined
  );
  const [selectedToppings, setSelectedToppings] = useState<FoodTopping[]>([]);

  // Default options for broth / sauce
  const defaultBrothOptions =
    food.categoryId === 'cat-2'
      ? ['Nước dùng ninh xương truyền thống', 'Nước dùng cay nồng Sa Tế', 'Nước dùng thanh ngọt ít mỡ', 'Nước lẩu Thái chua cay']
      : food.categoryId === 'cat-1'
      ? ['Nước sốt mắm tỏi đậm đà', 'Nước sốt bơ tỏi thơm ngậy', 'Nước sốt xá xíu ngọt nhẹ', 'Sốt ớt cay nồng']
      : ['Chuẩn vị căng tin', 'Nhiều sốt/nước dùng', 'Ít sốt/nước dùng'];

  const [selectedBroth, setSelectedBroth] = useState<string>(defaultBrothOptions[0]);
  const [notes, setNotes] = useState('');

  const toggleTopping = (topping: FoodTopping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const sizePrice = selectedSize ? selectedSize.price : 0;
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const unitPrice = food.price + sizePrice + toppingsPrice;
  const totalPrice = unitPrice * quantity;

  // Check if this food is in the cart
  const cartItemsForThisFood = cart.filter((item) => item.food.id === food.id);
  const thisFoodInCartQty = cartItemsForThisFood.reduce((sum, item) => sum + item.quantity, 0);

  // Cart summary for bottom bar
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleBack = () => {
    if (viewParams?.fromView) {
      navigateTo(viewParams.fromView, viewParams.fromParams);
    } else {
      navigateTo('home');
    }
  };

  const handleAddToCart = () => {
    const fullNotes = `${selectedBroth ? `[Sốt/Nước dùng: ${selectedBroth}] ` : ''}${notes}`.trim();
    addToCart(food, 1, selectedSize, selectedToppings, fullNotes);
  };

  const handleIncrease = () => {
    if (cartItemsForThisFood.length > 0) {
      const targetItem = cartItemsForThisFood[cartItemsForThisFood.length - 1];
      updateCartQuantity(targetItem.id, targetItem.quantity + 1);
    } else {
      handleAddToCart();
    }
  };

  const handleDecrease = () => {
    if (cartItemsForThisFood.length > 0) {
      const targetItem = cartItemsForThisFood[cartItemsForThisFood.length - 1];
      updateCartQuantity(targetItem.id, targetItem.quantity - 1);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: food.name,
        text: `Món ngon căng tin: ${food.name} - ${food.price.toLocaleString('vi-VN')}đ`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      showToast('Đã sao chép liên kết món ăn!', 'info');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Navigation Top Header */}
      <div className="flex items-center justify-between border-b border-[#E9DDE3] pb-3">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full text-[#1F2937] hover:text-[#FF4F8B] hover:bg-[#FFF3F7] transition-colors cursor-pointer"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-base sm:text-lg font-extrabold text-[#1F2937] text-center flex-1 truncate px-2">
          Chi tiết món ăn
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleFavorite(food.id)}
            className="p-2 rounded-full text-slate-400 hover:text-[#FF4F8B] hover:bg-[#FFF3F7] transition-colors cursor-pointer"
            title="Yêu thích"
          >
            <Heart className={`w-5 h-5 ${favorite ? 'fill-[#FF4F8B] text-[#FF4F8B]' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full text-slate-400 hover:text-[#1F2937] hover:bg-[#FFF3F7] transition-colors cursor-pointer"
            title="Chia sẻ"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area without outer card backgrounds */}
      <div className="space-y-3">
        {/* Food Banner Image */}
        <div className="relative aspect-16/9 bg-slate-100 rounded-2xl overflow-hidden border border-[#E9DDE3] shadow-2xs">
          <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {food.isNew && (
              <span className="bg-[#22C55E] text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                Món mới
              </span>
            )}
            {food.isVegetarian && (
              <span className="bg-[#06B6D4] text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                <Leaf className="w-3 h-3" /> Món chay
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
            <Clock className="w-3 h-3 text-[#FF4F8B]" /> Chuẩn bị ~{food.preparationTime} phút
          </div>
        </div>

        {/* Header Details */}
        <div className="px-0.5 space-y-1.5">
          {/* 1. Price First & Quick Plus (+) Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-2xl font-bold text-[#FF4F8B]">
                {unitPrice.toLocaleString('vi-VN')}đ
              </span>
              {food.originalPrice && (
                <span className="text-xs sm:text-sm text-[#94A3B8] line-through font-medium">
                  {food.originalPrice.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* Khi chưa có món trong giỏ: dấu (+). Khi đã thêm: giữ nguyên kích thước nút (+) w-8 h-8 và kéo dài capsule sang trái để hiện [-] và số lượng */}
            {thisFoodInCartQty === 0 ? (
              <button
                id="food-detail-quick-add-btn"
                type="button"
                onClick={handleAddToCart}
                className="w-8 h-8 rounded-xl bg-[#FFF3F7] hover:bg-[#FFE4EE] text-[#FF4F8B] border border-[#FFE4EE] flex items-center justify-center font-bold shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                title="Thêm vào giỏ hàng"
                aria-label="Thêm vào giỏ hàng"
              >
                <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            ) : (
              <div
                id="food-detail-qty-inline-ctrl"
                className="h-8 rounded-xl bg-[#FFF3F7] border border-[#FFE4EE] flex items-center shadow-2xs shrink-0"
              >
                <button
                  id="food-detail-minus-btn"
                  type="button"
                  onClick={handleDecrease}
                  className="w-8 h-8 rounded-xl text-[#FF4F8B] hover:bg-[#FFE4EE] active:scale-90 flex items-center justify-center font-bold cursor-pointer transition-colors shrink-0"
                  aria-label="Trừ bớt"
                  title="Trừ bớt"
                >
                  <Minus className="w-4.5 h-4.5 stroke-[2.5]" />
                </button>
                <span className="min-w-5 px-1 text-center font-extrabold text-xs sm:text-sm text-[#FF4F8B] select-none">
                  {thisFoodInCartQty}
                </span>
                <button
                  id="food-detail-plus-btn"
                  type="button"
                  onClick={handleIncrease}
                  className="w-8 h-8 rounded-xl text-[#FF4F8B] hover:bg-[#FFE4EE] active:scale-90 flex items-center justify-center font-bold cursor-pointer transition-colors shrink-0"
                  aria-label="Cộng thêm"
                  title="Cộng thêm"
                >
                  <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Food Name - Canteen Name */}
          <h1 className="text-sm sm:text-base font-bold text-[#1F2937] leading-snug">
            {food.name} <span className="text-slate-300 font-normal mx-1">-</span> <span className="text-[#64748B] font-medium text-xs sm:text-sm">{food.canteenName || canteen?.name || 'Căng tin trường'}</span>
          </h1>

          {/* 3. Rating & Sold count */}
          <div className="flex items-center gap-3 pt-0.5 text-xs">
            {/* Clickable Rating - no box background */}
            <button
              onClick={() => navigateTo('food-reviews', { foodId: food.id })}
              className="flex items-center gap-1 text-[#1F2937] hover:text-[#FF4F8B] transition-colors cursor-pointer group"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-semibold text-[#1F2937]">{food.rating}</span>
              <span className="text-[#94A3B8] font-normal text-[11px]">({food.reviewCount})</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#FF4F8B] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <span className="text-slate-300">•</span>

            {/* Sold Count - Icon only */}
            <div className="flex items-center gap-1 text-[#64748B] font-normal">
              <ShoppingBag className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <span>{food.soldCount || (food.reviewCount * 3 + 120)}+</span>
            </div>
          </div>

          {/* Description */}
          {food.description && (
            <p className="text-[#64748B] text-xs leading-relaxed pt-0.5">{food.description}</p>
          )}
        </div>
      </div>

      {/* Customization Options Area without outer background */}
      <div className="space-y-4 pt-1 px-0.5">
        {/* Size Selection */}
        {food.sizes && food.sizes.length > 0 && (
          <div>
            <h3 className="font-bold text-[#1F2937] text-xs sm:text-sm mb-2">Chọn kích cỡ (Size):</h3>
            <div className="grid grid-cols-2 gap-2">
              {food.sizes.map((size) => {
                const isSelected = selectedSize?.name === size.name;
                return (
                  <button
                    key={size.name}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF4F8B] bg-[#FFF3F7] text-[#FF4F8B] ring-2 ring-[#FF4F8B]/20'
                        : 'border-[#E9DDE3] hover:border-[#FF4F8B]/50 text-[#1F2937] bg-white'
                    }`}
                  >
                    <span>{size.name}</span>
                    <span className="text-[#1F2937] text-[11px] font-bold">
                      {size.price > 0 ? `+${size.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Broth / Sauce Options */}
        <div>
          <h3 className="font-bold text-[#1F2937] text-xs sm:text-sm mb-2">
            {food.categoryId === 'cat-2'
              ? '🍲 Chọn loại nước dùng / nước lẩu:'
              : food.categoryId === 'cat-1'
              ? '🍛 Chọn loại nước sốt / canh kèm:'
              : '🥣 Lựa chọn hương vị / nước sốt:'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {defaultBrothOptions.map((option) => {
              const isSelected = selectedBroth === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedBroth(option)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#FF4F8B] bg-[#FFF3F7] text-[#FF4F8B] ring-2 ring-[#FF4F8B]/20 font-semibold'
                      : 'border-[#E9DDE3] hover:border-[#FF4F8B]/50 text-[#1F2937] bg-white'
                  }`}
                >
                  <span className="line-clamp-1">{option}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#FF4F8B] shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topping Selection */}
        {food.toppings && food.toppings.length > 0 && (
          <div>
            <h3 className="font-bold text-[#1F2937] text-xs sm:text-sm mb-2">Thêm Topping / Món kèm:</h3>
            <div className="space-y-1.5">
              {food.toppings.map((topping) => {
                const isChecked = selectedToppings.some((t) => t.id === topping.id);
                return (
                  <div
                    key={topping.id}
                    onClick={() => toggleTopping(topping)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                      isChecked
                        ? 'border-[#FF4F8B] bg-[#FFF3F7] text-[#1F2937]'
                        : 'border-[#E9DDE3] hover:border-[#FF4F8B]/50 text-[#1F2937] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-[#FF4F8B] border-[#FF4F8B] text-white'
                            : 'border-[#CBD5E1] bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-medium text-[#1F2937]">{topping.name}</span>
                    </div>
                    <span className="font-bold text-[#FF4F8B] text-[11px]">
                      +{topping.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kitchen Notes */}
        <div>
          <h3 className="font-bold text-[#1F2937] text-xs sm:text-sm mb-1.5">Ghi chú cho nhà bếp:</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Không hành, ít cay, nhiều mỡ hành, nước đá riêng..."
            rows={2}
            className="w-full p-2.5 bg-white border border-[#E9DDE3] rounded-xl text-xs text-[#1F2937] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF4F8B] transition-all"
          />
        </div>
      </div>

      {/* Sticky Bottom Bar: Món nào có trong giỏ hàng thì mới có thanh xem giỏ hàng này */}
      {thisFoodInCartQty > 0 && (
        <div
          id="sticky-cart-bar"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E9DDE3] p-3 sm:p-4 shadow-xl animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="max-w-2xl mx-auto">
            <button
              id="view-cart-bar-btn"
              onClick={() => {
                if (!currentUser) {
                  showToast('Vui lòng đăng nhập để tiến hành đặt món và thanh toán!', 'info');
                  navigateTo('login', { next: 'checkout' });
                  return;
                }
                navigateTo('checkout');
              }}
              className="w-full bg-[#FF4F8B] hover:bg-[#E83E78] active:scale-98 text-white font-extrabold py-3 px-4 sm:px-5 rounded-2xl shadow-lg shadow-[#FF4F8B]/25 flex items-center justify-between text-xs sm:text-sm transition-all cursor-pointer"
            >
              {/* Bên trái: Icon giỏ hàng + Chữ "Xem giỏ hàng" + Số lượng ngay bên cạnh */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0" />
                <span className="font-bold text-sm sm:text-base tracking-tight">Xem giỏ hàng</span>
                <span className="bg-white text-[#FF4F8B] text-xs font-black px-2 py-0.5 rounded-full shadow-2xs">
                  {totalCartCount}
                </span>
              </div>

              {/* Bên phải (right): Giá & chuyển tới page thanh toán */}
              <div className="flex items-center gap-2 font-black text-sm sm:text-base tracking-tight">
                <span>{totalCartPrice.toLocaleString('vi-VN')}đ</span>
                <ChevronRight className="w-4.5 h-4.5 stroke-[3]" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
