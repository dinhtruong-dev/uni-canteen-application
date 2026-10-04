import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Search,
  Clock,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Users,
  Store,
  RefreshCw,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

export interface AdminTopbarProps {
  activeTabTitle: string;
  onSelectTab: (tab: string) => void;
  unreadNotifsCount?: number;
  onSearchGlobal?: (query: string) => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  activeTabTitle,
  onSelectTab,
  unreadNotifsCount = 0,
}) => {
  const { currentUser, refreshData, isLoadingData, logout, notifications } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left: Active Tab Title & Campus Status */}
      <div className="flex items-center gap-4 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-300" /> UNI CANTEEN ADMIN
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Toàn hệ thống hoạt động bình thường
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-100 tracking-tight truncate">
            {activeTabTitle}
          </h1>
        </div>
      </div>

      {/* Right: Actions, Clock, Role Switcher, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Real-time Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>
            {currentTime.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>

        {/* Refresh Data Button */}
        <button
          onClick={() => refreshData()}
          disabled={isLoadingData}
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Đồng bộ lại dữ liệu hệ thống"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-purple-400' : ''}`} />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-all relative cursor-pointer"
            title="Thông báo toàn trường"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-extrabold text-slate-200">Thông báo hệ thống</span>
                <button
                  onClick={() => {
                    setShowNotifMenu(false);
                    onSelectTab('notifications');
                  }}
                  className="text-[11px] text-purple-400 hover:underline cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="p-2 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
                    <p className="font-bold text-slate-200">{n.title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-[10px] text-purple-300 mt-1 block">{n.dateDisplay || n.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Role Switcher Pill for Evaluation */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-200 leading-tight">
                {currentUser?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-purple-300 font-semibold leading-none">
                {currentUser?.role || 'ADMIN'}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-extrabold text-slate-200">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Role: {currentUser?.role}
                </span>
              </div>

              <div className="border-t border-slate-800 pt-1 mt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
