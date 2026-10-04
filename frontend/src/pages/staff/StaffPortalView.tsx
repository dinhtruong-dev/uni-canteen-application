import React from 'react';
import { useApp } from '../../store/AppContext';
import { StaffLayout } from '../../layouts/StaffLayout/StaffLayout';
import { StaffDashboardView } from './StaffDashboardView';
import { StaffOrdersView } from './StaffOrdersView';
import { StaffFoodsView } from './StaffFoodsView';
import { StaffTablesView } from './StaffTablesView';
import { StaffPickupSlotsView } from './StaffPickupSlotsView';
import { StaffPromotionsView } from './StaffPromotionsView';
import { StaffReviewsView } from './StaffReviewsView';
import { StaffNotificationsView } from './StaffNotificationsView';
import { StaffStatisticsView } from './StaffStatisticsView';
import { Lock } from 'lucide-react';

export const StaffPortalView: React.FC = () => {
  const { currentView, navigateTo, currentUser } = useApp();

  // Strict Role Check Enforcement
  if (!currentUser || (currentUser.role !== 'STAFF' && currentUser.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest block mb-1">
              403 • ACCESS RESTRICTED
            </span>
            <h2 className="text-xl font-black text-slate-100">Khu Vực Nhân Viên Căn Tin</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Trang POS & Quản lý bếp (/staff) chỉ dành riêng cho tài khoản có vai trò{' '}
              <strong className="text-emerald-400">ROLE STAFF</strong>.
            </p>
          </div>
          <button
            onClick={() => navigateTo('login')}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Đăng Nhập Tài Khoản Nhân Viên</span>
          </button>
        </div>
      </div>
    );
  }

  // Determine active tab from currentView
  let activeTab = 'dashboard';
  if (currentView.startsWith('staff-')) {
    activeTab = currentView.replace('staff-', '');
  } else if (currentView === 'staff') {
    activeTab = 'dashboard';
  }

  const handleTabChange = (tab: string) => {
    navigateTo(`staff-${tab}`);
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StaffDashboardView />;
      case 'orders':
        return <StaffOrdersView />;
      case 'foods':
        return <StaffFoodsView />;
      case 'tables':
        return <StaffTablesView />;
      case 'pickup-slots':
        return <StaffPickupSlotsView />;
      case 'promotions':
        return <StaffPromotionsView />;
      case 'reviews':
        return <StaffReviewsView />;
      case 'notifications':
        return <StaffNotificationsView />;
      case 'statistics':
        return <StaffStatisticsView />;
      default:
        return <StaffDashboardView />;
    }
  };

  return (
    <StaffLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderActiveContent()}
    </StaffLayout>
  );
};
