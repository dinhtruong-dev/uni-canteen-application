import React from 'react';
import { useApp } from '../../store/AppContext';
import { FoodCard } from '../../components/customer/FoodCard';
import { HeaderNav } from '../../components/common/HeaderNav';
import { Heart } from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const { foods, favorites, navigateTo } = useApp();

  const favoriteFoods = foods.filter((f) => favorites.includes(f.id));

  return (
    <div className="-mt-1 sm:-mt-2 space-y-4 pb-20 max-w-4xl mx-auto px-1 sm:px-0">
      {/* Header Navigation Component */}
      <HeaderNav
        title="Món Ăn Yêu Thích"
        subtitle="Các món ăn bạn đã lưu để đặt nhanh"
        onBack={() => navigateTo('home')}
        rightAction={
          <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
            {favoriteFoods.length} món
          </span>
        }
      />

      {favoriteFoods.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3 max-w-md mx-auto my-6">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Chưa có món ăn yêu thích nào</h3>
          <p className="text-xs text-slate-500">
            Hãy bấm biểu tượng trái tim ❤️ trên các món ăn trong thực đơn để lưu lại nhé.
          </p>
          <button
            onClick={() => navigateTo('menu')}
            className="bg-orange-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors inline-block mt-2"
          >
            Khám phá thực đơn
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {favoriteFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onSelectFood={(selected) =>
                navigateTo('food-detail', { foodId: selected.id, food: selected, fromView: 'favorites' })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
