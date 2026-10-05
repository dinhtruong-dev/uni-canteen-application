import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  Store,
  UtensilsCrossed,
  FolderTree,
  Receipt,
  QrCode,
  Clock,
  MapPin,
  TicketPercent,
  Star,
  Bell,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Tv2,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

export interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingOrdersCount?: number;
  unreadNotifsCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingOrdersCount = 0,
  unreadNotifsCount = 0,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { currentUser, navigateTo, logout } = useApp();

  const menuSections = [
    {
      title: 'TỔNG QUAN',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      title: 'QUẢN TRỊ TÀI KHOẢN',
      items: [
        {
          id: 'users',
          label: 'Người dùng',
          icon: Users,
          badge: null,
        },
        {
          id: 'students',
          label: 'Sinh viên',
          icon: GraduationCap,
          badge: null,
        },
        {
          id: 'staff',
          label: 'Nhân viên',
          icon: Briefcase,
          badge: null,
        },
      ],
    },
    {
      title: 'CĂN TIN & THỰC ĐƠN',
      items: [
        {
          id: 'canteens',
          label: 'Căn tin',
          icon: Store,
          badge: null,
        },
        {
          id: 'foods',
          label: 'Món ăn',
          icon: UtensilsCrossed,
          badge: null,
        },
        {
          id: 'categories',
          label: 'Danh mục',
          icon: FolderTree,
          badge: null,
        },
      ],
    },
    {
      title: 'VẬN HÀNH & ĐƠN HÀNG',
      items: [
        {
          id: 'orders',
          label: 'Đơn hàng',
          icon: Receipt,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
          badgeColor: 'bg-rose-500 text-white font-bold',
        },
        {
          id: 'tables',
          label: 'Bàn & QR Code',
          icon: QrCode,
          badge: null,
        },
        {
          id: 'pickup-slots',
          label: 'Khung giờ Pickup',
          icon: Clock,
          badge: null,
        },
        {
          id: 'dormitories',
          label: 'Khu vực KTX',
          icon: MapPin,
          badge: null,
        },
      ],
    },
    {
      title: 'MARKETING & TƯƠNG TÁC',
      items: [
        {
          id: 'promotions',
          label: 'Khuyến mãi',
          icon: TicketPercent,
          badge: null,
        },
        {
          id: 'reviews',
          label: 'Đánh giá',
          icon: Star,
          badge: null,
        },
        {
          id: 'notifications',
          label: 'Thông báo',
          icon: Bell,
          badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
          badgeColor: 'bg-amber-400 text-slate-950 font-bold',
        },
      ],
    },
    {
      title: 'TÀI CHÍNH & HỆ THỐNG',
      items: [
        {
          id: 'payments',
          label: 'Thanh toán',
          icon: CreditCard,
          badge: null,
        },
        {
          id: 'statistics',
          label: 'Thống kê',
          icon: BarChart3,
          badge: null,
        },
        {
          id: 'settings',
          label: 'Cấu hình hệ thống',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none z-30 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-600/30 shrink-0">
            U
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-100 text-base tracking-tight truncate">
                  Uni Canteen
                </span>
              </div>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Scrollable Area */}
      <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-8 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${isActive
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
                        }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1.5 shrink-0 ${isActive
                        ? 'bg-slate-950 text-purple-300'
                        : item.badgeColor || 'bg-slate-800 text-slate-200'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Khoảng đệm bên dưới phần Cấu hình hệ thống */}
        <div className="h-6 shrink-0" aria-hidden="true" />
      </nav>
    </aside>
  );
};
