import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  FolderTree,
  QrCode,
  Clock,
  Star,
  Bell,
  BarChart3,
  Tv2,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Store,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

export interface StaffSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingOrdersCount?: number;
  unreadNotifsCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
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
      ],
    },
    {
      title: 'CĂN TIN & THỰC ĐƠN',
      items: [
        {
          id: 'canteen',
          label: 'Cài đặt Căn tin',
          icon: Store,
          badge: null,
        },
        {
          id: 'foods',
          label: 'Món ăn & Thực đơn',
          icon: UtensilsCrossed,
          badge: null,
        },
        {
          id: 'categories',
          label: 'Danh mục món',
          icon: FolderTree,
          badge: null,
        },
      ],
    },
    {
      title: 'TƯƠNG TÁC & BÁO CÁO',
      items: [
        {
          id: 'reviews',
          label: 'Đánh giá món ăn',
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
        {
          id: 'statistics',
          label: 'Báo cáo thống kê',
          icon: BarChart3,
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
          <img
            src="/images/logo.png"
            alt="Uni Canteen Food"
            className="w-10 h-10 rounded-2xl object-contain bg-white p-0.5 shadow-lg shadow-emerald-500/20 shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-100 text-base tracking-tight truncate">
                  Uni Canteen
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-2.5 h-2.5" /> ROLE STAFF
              </span>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Scrollable Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
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
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                        }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1.5 shrink-0 ${isActive
                        ? 'bg-slate-950 text-emerald-300'
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

        {/* Quick KDS Screen Link */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <button
            onClick={() => navigateTo('kitchen-kds')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer ${isCollapsed ? 'justify-center px-2' : ''
              }`}
            title="Màn hình KDS Bếp"
          >
            <Tv2 className="w-4 h-4 text-amber-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Màn hình KDS Bếp</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
};
