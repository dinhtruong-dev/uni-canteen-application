import React, { useState } from 'react';
import { AdminSidebar } from './Sidebar';
import { AdminTopbar } from './Topbar';
import { useApp } from '../../store/AppContext';

export interface AdminLayoutProps {
  initialTab?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  initialTab = 'dashboard',
  activeTab: propActiveTab,
  onTabChange,
  children,
}) => {
  const [internalTab, setInternalTab] = useState(propActiveTab || initialTab);
  const activeTab = propActiveTab || internalTab;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { orders, notifications, navigateTo } = useApp();

  const handleSelectTab = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
      navigateTo(`admin-${tab}`);
    }
  };

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED'
  ).length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard Tổng Quan Hệ Thống Uni Canteen',
    users: 'Quản Lý Người Dùng & Phân Quyền',
    students: 'Quản Lý Hồ Sơ Sinh Viên Toàn Trường',
    staff: 'Quản Lý Nhân Viên & Phân Bổ Căn Tin',
    canteens: 'Quản Lý Danh Sách & Hoạt Động Căn Tin',
    foods: 'Quản Lý Danh Mục Món Ăn & Thực Đơn Toàn Trường',
    categories: 'Quản Lý Nhóm & Danh Mục Món',
    orders: 'Tra Cứu & Quản Lý Đơn Hàng Toàn Hệ Thống',
    tables: 'Quản Lý Bàn Ăn & Tạo Mã QR Bàn',
    'pickup-slots': 'Cấu Hình Khung Giờ Nhận Món (Pickup)',
    dormitories: 'Quản Lý Toà Nhà KTX & Vị Trí Giao Hàng',
    promotions: 'Quản Lý Chương Trình Khuyến Mãi & Voucher',
    reviews: 'Kiểm Duyệt Đánh Giá & Phản Hồi Món Ăn',
    notifications: 'Phát Thông Báo Toàn Trường & Căn Tin',
    payments: 'Lịch Sử Giao Dịch & Quản Lý Dòng Tiền',
    statistics: 'Báo Cáo Phân Tích & Thống Kê Doanh Thu',
    settings: 'Cấu Hình Chung Hệ Thống Uni Canteen',
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        pendingOrdersCount={pendingOrdersCount}
        unreadNotifsCount={unreadNotifsCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Admin Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-950">
        {/* Admin Topbar */}
        <AdminTopbar
          activeTabTitle={tabTitles[activeTab] || 'Quản Trị Toàn Hệ Thống'}
          onSelectTab={handleSelectTab}
          unreadNotifsCount={unreadNotifsCount}
        />

        {/* 3. Admin Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950 text-slate-100 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="max-w-[1920px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
