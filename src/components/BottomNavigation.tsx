import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, ShoppingBag, User, Bell, Heart } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { currentView, navigateTo, cart, currentUser, unreadNotifCount, favorites } = useApp();

  if (currentUser.role !== 'STUDENT') return null;

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'favorites', label: 'Yêu thích', icon: Heart, badge: favorites.length, isHeart: true },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
    { id: 'notifications', label: 'Thông báo', icon: Bell, badge: unreadNotifCount },
    { id: 'profile', label: 'Tài khoản', icon: User },
  ];

  return (
    <>
      {/* Floating Circular Cart Button */}
      <div className="fixed bottom-16 right-4 sm:right-8 z-50">
        <button
          onClick={() => navigateTo('cart')}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#FF4F8B] hover:bg-[#E83E78] text-white shadow-lg shadow-[#FF4F8B]/30 flex items-center justify-center relative transition-all active:scale-95 cursor-pointer border-2 border-white"
          aria-label="Giỏ hàng"
          title="Giỏ hàng của bạn"
        >
          <ShoppingBag className="w-6 h-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF7A59] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E9DDE3] shadow-lg px-1 sm:px-2 py-1.5 flex items-center justify-around max-w-2xl mx-auto sm:rounded-t-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.id ||
            (item.id === 'orders' && currentView === 'order-detail');

          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#FF4F8B] font-bold'
                  : 'text-[#64748B] font-medium hover:text-[#1F2937]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${isActive ? 'scale-110' : ''} ${
                    isActive && item.isHeart ? 'fill-[#FF4F8B]' : ''
                  } transition-transform`}
                />
                {Boolean(item.badge && item.badge > 0) && (
                  <span
                    className="absolute -top-1 -right-2 text-white text-[9px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center border border-white bg-[#FF4F8B]"
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

