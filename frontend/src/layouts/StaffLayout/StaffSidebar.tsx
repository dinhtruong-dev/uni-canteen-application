import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  FolderTree,
  QrCode,
  Clock,
  TicketPercent,
  Star,
  Bell,
  BarChart3,
  Tv2,
  LogOut,
  Sparkles,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface StaffSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingOrdersCount?: number;
  unreadNotifsCount?: number;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingOrdersCount = 0,
  unreadNotifsCount = 0,
}) => {
  const { currentUser, navigateTo, logout } = useApp();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan (Dashboard)',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Quản lý Đơn hàng',
      icon: Receipt,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'foods',
      label: 'Món ăn & Thực đơn',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      id: 'tables',
      label: 'Bàn ăn & Mã QR',
      icon: QrCode,
      badge: null,
    },
    {
      id: 'pickup-slots',
      label: 'Khung giờ nhận món',
      icon: Clock,
      badge: null,
    },
    {
      id: 'promotions',
      label: 'Mã khuyến mãi',
      icon: TicketPercent,
      badge: null,
    },
    {
      id: 'reviews',
      label: 'Đánh giá món ăn',
      icon: Star,
      badge: null,
    },
    {
      id: 'notifications',
      label: 'Thông báo vận hành',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'statistics',
      label: 'Báo cáo thống kê',
      icon: BarChart3,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
            U
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-100 text-base tracking-tight">Uni Canteen</span>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-2.5 h-2.5" /> ROLE STAFF
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Phân hệ Quản trị Bếp & Quầy
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-slate-950 text-emerald-400' : item.badgeColor || 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Separator */}
        <div className="pt-3 pb-1">
          <div className="border-t border-slate-800" />
        </div>

        {/* Quick KDS Button */}
        <button
          onClick={() => navigateTo('kitchen-kds')}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Tv2 className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div className="font-semibold text-xs leading-none">Màn hình Bếp (KDS)</div>
              <div className="text-[10px] text-amber-400/70 mt-1">Cảm ứng ngang toàn màn hình</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </button>
      </nav>

      {/* User Footer & Switch Back */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-sm">
            {currentUser?.name ? currentUser.name.charAt(0) : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {currentUser?.name || 'Nhân viên Căn tin'}
            </div>
            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>{currentUser?.department || 'Tổ chế biến Căng tin'}</span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <button
            onClick={() => navigateTo('home')}
            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors text-center truncate"
            title="Xem giao diện Sinh viên đặt món"
          >
            Giao diện Sinh viên
          </button>
          <button
            onClick={() => {
              logout();
            }}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
