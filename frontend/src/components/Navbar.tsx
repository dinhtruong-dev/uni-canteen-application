import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  UtensilsCrossed,
  ShoppingCart,
  Bell,
  Wallet,
  User as UserIcon,
  Search,
  Menu as MenuIcon,
  X,
  LogOut,
  ChevronDown,
  QrCode,
  Heart,
  ShieldAlert,
  ChefHat,
  Sparkles,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC<{ onOpenWalletModal?: () => void }> = ({ onOpenWalletModal }) => {
  const {
    currentUser,
    cart,
    notifications,
    unreadNotifCount,
    markNotifAsRead,
    markAllNotifsAsRead,
    walletBalance,
    logout,
    currentView,
    navigateTo,
    setQrScannerOpen,
    setWalletModalOpen,
  } = useApp();

  const handleOpenWallet = () => {
    if (onOpenWalletModal) {
      onOpenWalletModal();
    } else {
      setWalletModalOpen(true);
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('menu', { search: searchQuery });
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <button
            onClick={() => {
              if (currentUser?.role === 'STAFF') navigateTo('staff-dashboard');
              else if (currentUser?.role === 'ADMIN') navigateTo('admin-dashboard');
              else navigateTo('home');
            }}
            className="flex items-center gap-2 group text-left shrink-0 cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-[#FF4F8B] to-[#FF7A59] flex items-center justify-center text-white shadow-md shadow-[#FF4F8B]/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl text-[#1F2937] tracking-tight flex items-center gap-0.5">
                Uni<span className="text-[#FF4F8B]">Eat</span>
              </span>
              <span className="hidden sm:block text-[9px] sm:text-[10px] font-medium text-[#64748B] uppercase tracking-wider -mt-1">
                Campus Food System
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          {!currentUser || currentUser.role === 'STUDENT' ? (
            <nav className="hidden lg:flex items-center gap-1 font-medium text-sm">
              <button
                onClick={() => navigateTo('home')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'home'
                    ? 'text-[#FF4F8B] bg-[#FFF3F7] font-semibold'
                    : 'text-[#64748B] hover:text-[#FF4F8B] hover:bg-[#FFF3F7]'
                }`}
              >
                Trang chủ
              </button>
              <button
                onClick={() => navigateTo('category')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'category'
                    ? 'text-[#FF4F8B] bg-[#FFF3F7] font-semibold'
                    : 'text-[#64748B] hover:text-[#FF4F8B] hover:bg-[#FFF3F7]'
                }`}
              >
                Danh mục món
              </button>
              <button
                onClick={() => navigateTo('orders')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'orders' || currentView === 'order-detail'
                    ? 'text-[#FF4F8B] bg-[#FFF3F7] font-semibold'
                    : 'text-[#64748B] hover:text-[#FF4F8B] hover:bg-[#FFF3F7]'
                }`}
              >
                Hoạt động
              </button>
              <button
                onClick={() => navigateTo('favorites')}
                className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'favorites'
                    ? 'text-[#FF4F8B] bg-[#FFF3F7] font-semibold'
                    : 'text-[#64748B] hover:text-[#FF4F8B] hover:bg-[#FFF3F7]'
                }`}
              >
                <Heart className="w-4 h-4 text-[#FF4F8B]" />
                Yêu thích
              </button>
            </nav>
          ) : currentUser.role === 'STAFF' ? (
            <nav className="hidden lg:flex items-center gap-1 font-medium text-sm">
              <button
                onClick={() => navigateTo('staff-dashboard')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'staff-dashboard'
                    ? 'text-emerald-600 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                Quản lý đơn
              </button>
              <button
                onClick={() => navigateTo('staff-foods')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'staff-foods'
                    ? 'text-emerald-600 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                Món ăn & Thực đơn
              </button>
              <button
                onClick={() => navigateTo('staff-tables')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'staff-tables'
                    ? 'text-emerald-600 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                Sơ đồ bàn & QR Code
              </button>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-1 font-medium text-sm">
              <button
                onClick={() => navigateTo('admin-dashboard')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'admin-dashboard'
                    ? 'text-purple-600 bg-purple-50 font-semibold'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                }`}
              >
                Dashboard Thống kê
              </button>
              <button
                onClick={() => navigateTo('admin-users')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'admin-users'
                    ? 'text-purple-600 bg-purple-50 font-semibold'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                }`}
              >
                Người dùng & Phân quyền
              </button>
              <button
                onClick={() => navigateTo('admin-canteens')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'admin-canteens'
                    ? 'text-purple-600 bg-purple-50 font-semibold'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                }`}
              >
                Căng tin & Địa điểm
              </button>
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Table QR Scan Trigger button for Student */}
            {currentUser.role === 'STUDENT' && (
              <button
                onClick={() => navigateTo('qr-scanner')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF3F7] text-[#FF4F8B] hover:bg-[#FFE4EE] border border-[#FFE4EE] text-xs font-bold transition-all shrink-0 cursor-pointer"
                title="Quét QR bàn để ăn tại căng tin"
              >
                <QrCode className="w-4 h-4 text-[#FF4F8B]" />
                <span>Quét QR Bàn</span>
              </button>
            )}

            {/* Notification Bell Button -> Opens dedicated Notifications View */}
            <button
              onClick={() => {
                navigateTo('notifications');
                setUserDropdownOpen(false);
                setNotifDropdownOpen(false);
              }}
              className={`p-2 rounded-full relative transition-colors cursor-pointer shrink-0 ${
                currentView === 'notifications'
                  ? 'bg-[#FFE4EE] text-[#FF4F8B] font-bold'
                  : 'text-[#64748B] hover:text-[#1F2937] hover:bg-slate-100'
              }`}
              aria-label="Thông báo"
              title="Xem trang thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#FF4F8B] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* User Avatar Menu or Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#FF4F8B]/40"
                  />
                  <span className="hidden md:inline text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-bold text-sm text-slate-900">{currentUser.name}</p>
                        <p className="text-xs text-slate-500">{currentUser.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                          {currentUser.role === 'STUDENT'
                            ? `MSSV: ${currentUser.studentId || 'N/A'}`
                            : currentUser.role === 'STAFF'
                            ? 'Nhân viên Căng tin'
                            : 'Quản trị viên (Admin)'}
                        </div>
                      </div>

                      <div className="py-1 text-sm text-slate-700 font-medium">
                        {currentUser.role === 'STUDENT' && (
                          <>
                            <button
                              onClick={() => {
                                navigateTo('profile');
                                setUserDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <UserIcon className="w-4 h-4 text-slate-400" />
                              Hồ sơ & Địa điểm KTX
                            </button>
                            <button
                              onClick={() => {
                                navigateTo('orders');
                                setUserDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <ShoppingCart className="w-4 h-4 text-slate-400" />
                              Lịch sử đơn hàng
                            </button>
                            <button
                              onClick={() => {
                                handleOpenWallet();
                                setUserDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition-colors text-emerald-700 font-semibold cursor-pointer"
                            >
                              <Wallet className="w-4 h-4 text-emerald-600" />
                              Ví Sinh Viên: {walletBalance.toLocaleString('vi-VN')}đ
                            </button>
                          </>
                        )}

                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-semibold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('login', { next: currentView !== 'login' ? currentView : 'home' })}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={() => navigateTo('register', { next: currentView !== 'register' ? currentView : 'home' })}
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3 overflow-hidden shadow-xl"
          >
            {!currentUser ? (
              <div className="space-y-3">
                <div className="bg-orange-50/80 border border-orange-100 rounded-2xl p-4 text-center">
                  <p className="font-extrabold text-sm text-slate-900">Chào bạn đến với UniEat!</p>
                  <p className="text-xs text-slate-500 mt-1">Đăng nhập để đặt món nhanh và nhận khuyến mãi</p>
                  <div className="mt-3.5 flex items-center justify-center gap-2.5">
                    <button
                      onClick={() => {
                        navigateTo('login', { next: currentView !== 'login' ? currentView : 'home' });
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => {
                        navigateTo('register', { next: currentView !== 'register' ? currentView : 'home' });
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                    >
                      Đăng ký
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      navigateTo('home');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                      currentView === 'home'
                        ? 'text-[#FF4F8B] bg-[#FFF3F7]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Trang chủ</span>
                  </button>
                  <button
                    onClick={() => {
                      navigateTo('category');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                    <span>Thực đơn Căn tin</span>
                  </button>
                </div>
              </div>
            ) : currentUser.role === 'STUDENT' ? (
              <>
                {/* Mobile User Card */}
                <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/30"
                    />
                    <div>
                      <p className="font-extrabold text-xs text-slate-900">{currentUser.name}</p>
                      <p className="text-[10px] font-semibold text-orange-700">MSSV: {currentUser.studentId}</p>
                      <p className="text-[11px] font-mono text-emerald-700 font-extrabold mt-0.5">
                        Ví: {walletBalance.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleOpenWallet();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>+Nạp Tiền</span>
                  </button>
                </div>

                {/* Quick QR Table Scan Button */}
                <button
                  onClick={() => {
                    navigateTo('qr-scanner');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl font-extrabold text-xs bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Quét QR Bàn Ăn Tại Căng Tin</span>
                </button>

                {/* Navigation Links */}
                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => {
                      navigateTo('home');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                      currentView === 'home'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>Trang chủ</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateTo('menu');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                      currentView === 'menu'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>Menu Thực Đơn</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateTo('orders');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                      currentView === 'orders' || currentView === 'order-detail'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Hoạt động</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateTo('favorites');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                      currentView === 'favorites'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Món ăn yêu thích</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateTo('profile');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                      currentView === 'profile'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span>Hồ sơ & Địa điểm KTX</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={logout}
                    className="text-xs text-rose-600 font-bold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            ) : currentUser.role === 'STAFF' ? (
              <>
                <button
                  onClick={() => {
                    navigateTo('staff-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg font-medium text-emerald-700 bg-emerald-50"
                >
                  Quản lý Đơn hàng
                </button>
                <button
                  onClick={() => {
                    navigateTo('staff-foods');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg font-medium text-slate-800"
                >
                  Quản lý Món ăn
                </button>
                <button
                  onClick={() => {
                    navigateTo('staff-tables');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg font-medium text-slate-800"
                >
                  Quản lý Bàn & Mã QR
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigateTo('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg font-medium text-purple-700 bg-purple-50"
                >
                  Thống kê hệ thống
                </button>
                <button
                  onClick={() => {
                    navigateTo('admin-users');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg font-medium text-slate-800"
                >
                  Quản lý Người dùng
                </button>
                <button
                  onClick={() => {
                    navigateTo('admin-canteens');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg font-medium text-slate-800"
                >
                  Quản lý Căng tin
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
