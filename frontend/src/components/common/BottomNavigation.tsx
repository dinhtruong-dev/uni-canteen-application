import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import { Home, Clock, Heart, User, Bell, ShoppingBag } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { currentView, navigateTo, cart, unreadNotifCount, currentUser, showToast } = useApp();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  // Khi chuyển giữa các tab chính, luôn hiển thị taskbar
  useEffect(() => {
    setIsVisible(true);
    lastScrollYRef.current = window.scrollY || document.documentElement.scrollTop;
  }, [currentView]);

  // Hiệu ứng cuộn: ở trang 'orders' (Hoạt động) taskbar cố định KHÔNG cuộn xuống;
  // còn ở 'home' (Trang chủ), 'favorites' (Yêu thích), 'notifications' (Thông báo), 'profile' (Tài khoản) khi kéo xuống sẽ cuộn ẩn, kéo lên hiện lại
  const scrollHideViews = ['home', 'favorites', 'notifications', 'profile'];

  useEffect(() => {
    // Nếu trang hiện tại không thuộc nhóm cuộn ẩn (ví dụ: 'orders' - Hoạt động), taskbar luôn cố định hiển thị
    if (!scrollHideViews.includes(currentView)) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;

      // Khi ở gần đầu trang luôn hiển thị
      if (currentScrollY < 60) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollYRef.current;
      // Ngưỡng di chuyển để phản hồi êm mượt
      if (Math.abs(diff) > 8) {
        if (diff > 0) {
          // Kéo xuống -> ẩn taskbar
          setIsVisible(false);
        } else {
          // Kéo lên -> hiện taskbar
          setIsVisible(true);
        }
        lastScrollYRef.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentView]);

  // Các trang chính thuộc thanh Taskbar điều hướng
  const isTaskbarView = ['home', 'orders', 'favorites', 'notifications', 'profile'].includes(currentView);

  // Chỉ ẩn thanh Taskbar khi ở các trang con (chi tiết món ăn, thanh toán, quản trị...)
  if (!isTaskbarView) {
    return null;
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'orders', label: 'Hoạt động', icon: Clock },
    { id: 'favorites', label: 'Yêu thích', icon: Heart },
    { id: 'notifications', label: 'Thông báo', icon: Bell, badge: unreadNotifCount },
    { id: 'profile', label: 'Tài khoản', icon: User },
  ];

  const handleItemClick = (id: string) => {
    if (id === 'home') {
      navigateTo('home');
      return;
    }
    if (!currentUser) {
      const messages: Record<string, string> = {
        orders: 'Vui lòng đăng nhập để xem lịch sử đơn hàng!',
        favorites: 'Vui lòng đăng nhập để xem danh sách món yêu thích!',
        notifications: 'Vui lòng đăng nhập để xem thông báo!',
        profile: 'Vui lòng đăng nhập để quản lý tài khoản!',
      };
      showToast(messages[id] || 'Vui lòng đăng nhập để tiếp tục!', 'info');
      navigateTo('login', { next: id });
      return;
    }
    navigateTo(id);
  };

  return (
    <div
      className={`fixed bottom-4 left-0 right-0 z-50 pointer-events-none flex items-center justify-center px-4 transition-all duration-300 ease-in-out ${isVisible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
    >
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Floating Capsule Taskbar */}
        <nav
          id="app-bottom-taskbar"
          className="bg-[#edf1f3]/90 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.1)] rounded-full px-3.5 sm:px-5 py-1.5 flex items-center gap-2 sm:gap-4"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentView === item.id ||
              (item.id === 'orders' && currentView === 'order-detail');

            return (
              <button
                key={item.id}
                id={`taskbar-btn-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                className={`relative flex items-center justify-center rounded-full transition-all cursor-pointer ${isActive
                  ? 'w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-[#9af4ed] to-[#cbfcf8] text-[#007068] shadow-xs scale-105'
                  : 'w-10 h-10 text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
                aria-label={item.label}
                title={item.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.9]'}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Nút Giỏ hàng nổi tròn bên phải thanh dock */}
        <button
          id="taskbar-quick-hub-btn"
          onClick={() => navigateTo('cart')}
          className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full border shadow-[0_8px_30px_rgba(0,0,0,0.1)] flex items-center justify-center relative cursor-pointer active:scale-95 transition-all hover:shadow-lg group ${currentView === 'cart'
            ? 'bg-gradient-to-tr from-[#9af4ed] to-[#cbfcf8] text-[#007068] border-[#81ece5]'
            : 'bg-white/95 backdrop-blur-md border-slate-200/80 text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          aria-label="Giỏ hàng"
          title="Giỏ hàng của bạn"
        >
          <ShoppingBag
            className={`w-5.5 h-5.5 transition-transform group-hover:scale-110 ${currentView === 'cart' ? 'stroke-[2.3]' : 'stroke-[1.9]'
              }`}
          />

          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#ff4f8b] text-white text-[10px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};


