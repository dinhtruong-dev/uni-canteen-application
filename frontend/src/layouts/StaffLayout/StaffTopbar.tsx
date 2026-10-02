import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  QrCode,
  Bell,
  Store,
  ChevronDown,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface StaffTopbarProps {
  activeTabTitle: string;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPickupModal: () => void;
  onSelectTab: (tab: string) => void;
  unreadNotifsCount?: number;
  canteenName?: string;
}

export const StaffTopbar: React.FC<StaffTopbarProps> = ({
  activeTabTitle,
  isSoundEnabled,
  onToggleSound,
  onOpenPickupModal,
  onSelectTab,
  unreadNotifsCount = 0,
  canteenName = 'Căng Tin A - Giảng Đường Trung Tâm A2',
}) => {
  const { currentUser, navigateTo } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      {/* Left: Current Section Title & Canteen Badge */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>{activeTabTitle}</span>
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium text-slate-300">{canteenName}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Đang mở cửa
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Clock, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Live Real-time Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {currentTime.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>

        {/* Quick Pickup Code Verification Button */}
        <button
          onClick={onOpenPickupModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-102 active:scale-98"
          title="Nhập mã đơn hoặc quét QR để khách lấy món mang về"
        >
          <QrCode className="w-4 h-4 text-slate-950" />
          <span className="hidden sm:inline">Quét / Nhập mã nhận món (PICKUP)</span>
          <span className="sm:hidden">Mã nhận món</span>
        </button>

        {/* Sound Alarm Toggle */}
        <button
          onClick={onToggleSound}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
            isSoundEnabled
              ? 'bg-slate-800 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10'
              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title={isSoundEnabled ? 'Âm báo đơn mới đang bật' : 'Âm báo đang tắt (nhấn để bật)'}
        >
          {isSoundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Âm báo ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Âm báo OFF</span>
            </>
          )}
        </button>

        {/* Notifications Button */}
        <button
          onClick={() => onSelectTab('notifications')}
          className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-colors"
          title="Xem thông báo vận hành"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-slate-900 animate-bounce">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center">
              {currentUser?.name ? currentUser.name.charAt(0) : 'S'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {currentUser?.name || 'Nhân viên'}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">Bếp Căn tin A</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="text-xs font-bold text-slate-200">{currentUser?.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
                <div className="mt-1 inline-block text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Quyền: Nhân viên Căn tin (Staff)
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigateTo('kitchen-kds');
                }}
                className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Mở Màn hình Bếp KDS
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigateTo('home');
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Xem Giao diện Khách hàng (Mobile)
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  localStorage.removeItem('token');
                  localStorage.removeItem('unieat_jwt');
                  navigateTo('landing');
                }}
                className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
              >
                Đăng xuất tài khoản
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
