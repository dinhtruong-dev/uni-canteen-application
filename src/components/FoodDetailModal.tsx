import React, { useState } from 'react';
import { FoodItem, FoodTopping, FoodSize } from '../types';
import { useApp } from '../context/AppContext';
import { X, Star, Minus, Plus, ShoppingBag, Clock, Check, Utensils, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FoodDetailModalProps {
  food: FoodItem | null;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ food, onClose }) => {
  const { addToCart, toggleFavorite, isFavorite } = useApp();

  if (!food) return null;

  const favorite = isFavorite(food.id);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<FoodSize | undefined>(
    food.sizes && food.sizes.length > 0 ? food.sizes[0] : undefined
  );
  const [selectedToppings, setSelectedToppings] = useState<FoodTopping[]>([]);
  
  // Broth / Sauce / Soup options
  const defaultBrothOptions = food.categoryId === 'cat-2' // Bún & Phở
    ? ['Nước dùng ninh xương truyền thống', 'Nước dùng cay nồng Sa Tế', 'Nước dùng thanh ngọt ít mỡ', 'Nước lẩu Thái chua cay']
    : food.categoryId === 'cat-1' // Cơm
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

  const handleAddToCart = () => {
    const fullNotes = `${selectedBroth ? `[Loại nước/sốt: ${selectedBroth}] ` : ''}${notes}`.trim();
    addToCart(food, quantity, selectedSize, selectedToppings, fullNotes);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl my-8 relative flex flex-col max-h-[90vh]"
        >
          {/* Top Actions: Close & Favorite */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(food.id)}
              className="w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 hover:text-rose-400 transition-colors cursor-pointer shadow-sm"
              title={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            >
              <Heart className={`w-5 h-5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer shadow-sm"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Header Image */}
          <div className="relative aspect-16/9 bg-slate-100 shrink-0">
            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-orange-600" /> Chuẩn bị: ~{food.preparationTime} phút
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto flex-1 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-md">
                  {food.categoryName || 'Món chính'}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{food.rating}</span>
                  <span className="text-slate-400 font-normal">({food.reviewCount} đánh giá)</span>
                </div>
              </div>

              <h2 className="font-semibold text-slate-800 text-xl mt-2">{food.name}</h2>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">{food.description}</p>
            </div>

            {/* Ingredients */}
            {food.ingredients && food.ingredients.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">Thành phần tươi ngon:</span>
                <p>{food.ingredients.join(' • ')}</p>
              </div>
            )}

            {/* Size Options */}
            {food.sizes && food.sizes.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2.5">Chọn kích cỡ (Size):</h4>
                <div className="grid grid-cols-2 gap-2">
                  {food.sizes.map((size) => {
                    const isSelected = selectedSize?.name === size.name;
                    return (
                      <button
                        key={size.name}
                        onClick={() => setSelectedSize(size)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/50 text-orange-950 ring-2 ring-orange-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span>{size.name}</span>
                        <span className="font-bold text-slate-900">
                          {size.price > 0 ? `+${size.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Broth / Sauce / Flavor Selection */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2.5">
                {food.categoryId === 'cat-2'
                  ? '🍲 Chọn loại nước dùng / nước lẩu:'
                  : food.categoryId === 'cat-1'
                  ? '🍛 Chọn loại nước sốt / canh kèm:'
                  : '🥣 Lựa chọn hương vị / nước sốt:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {defaultBrothOptions.map((option) => {
                  const isSelected = selectedBroth === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedBroth(option)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/70 text-orange-950 ring-2 ring-orange-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="line-clamp-1">{option}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toppings Options */}
            {food.toppings && food.toppings.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2.5">Thêm Topping / Món kèm:</h4>
                <div className="space-y-2">
                  {food.toppings.map((topping) => {
                    const isChecked = selectedToppings.some((t) => t.id === topping.id);
                    return (
                      <label
                        key={topping.id}
                        onClick={() => toggleTopping(topping)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                          isChecked
                            ? 'border-orange-500 bg-orange-50/40 text-orange-950'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-orange-500 border-orange-500 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{topping.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">
                          +{topping.price.toLocaleString('vi-VN')}đ
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions / Notes */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Ghi chú cho nhà bếp:</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Không hành, ít cay, nhiều mỡ hành, nước đá riêng..."
                rows={2}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            {/* Student Reviews Section */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span>Đánh giá từ sinh viên ({food.reviewCount})</span>
                </h4>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {food.rating} / 5.0
                </span>
              </div>

              {/* Review List */}
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/90 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-extrabold text-[10px] flex items-center justify-center">
                        SV
                      </span>
                      <span className="font-bold text-slate-800">Trần Minh Quân (KTX A1)</span>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                  <p className="text-slate-600 pl-8">Món ăn rất vừa miệng, đùi gà chiên giòn rụm nóng hổi. Căng tin phục vụ cực nhanh!</p>
                  <span className="text-[10px] text-slate-400 pl-8 block">Hôm qua • Đã mua tại Căng tin</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/90 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px] flex items-center justify-center">
                        LH
                      </span>
                      <span className="font-bold text-slate-800">Lê Thu Hà (Khoa CNTT)</span>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                  <p className="text-slate-600 pl-8">Nước dùng đậm đà, khẩu phần đầy đặn đủ năng lượng cho cả buổi học chiều.</p>
                  <span className="text-[10px] text-slate-400 pl-8 block">2 ngày trước • Đã mua giao KTX</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center gap-4">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-extrabold text-sm text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-between text-sm transition-all"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Thêm vào giỏ
              </span>
              <span className="font-extrabold">{totalPrice.toLocaleString('vi-VN')}đ</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
