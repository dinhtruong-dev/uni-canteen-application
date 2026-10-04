import React from 'react';
import { useApp } from '../../store/AppContext';
import { AdminLayout } from '../../layouts/AdminLayout/AdminLayout';
import { AdminOverviewView } from './AdminOverviewView';
import { AdminUsersView } from './AdminUsersView';
import { AdminStudentsView } from './AdminStudentsView';
import { AdminStaffView } from './AdminStaffView';
import { AdminCanteensView } from './AdminCanteensView';
import { AdminFoodsView } from './AdminFoodsView';
import { AdminCategoriesView } from './AdminCategoriesView';
import { AdminOrdersView } from './AdminOrdersView';
import { AdminTablesView } from './AdminTablesView';
import { AdminPickupSlotsView } from './AdminPickupSlotsView';
import { AdminDormitoriesView } from './AdminDormitoriesView';
import { AdminPromotionsView } from './AdminPromotionsView';
import { AdminReviewsView } from './AdminReviewsView';
import { AdminNotificationsView } from './AdminNotificationsView';
import { AdminPaymentsView } from './AdminPaymentsView';
import { AdminStatisticsView } from './AdminStatisticsView';
import { AdminSettingsView } from './AdminSettingsView';
import { ShieldAlert, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export const AdminPortalView: React.FC = () => {
  const { currentView, navigateTo, currentUser } = useApp();

  // Strict Role Check Enforcement
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-black text-rose-400 uppercase tracking-widest block mb-1">
              403 • ACCESS DENIED
            </span>
            <h2 className="text-xl font-black text-slate-100">
              Quyền Truy Cập Bị Từ Chối
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Khu vực Quản trị Toàn trường (/admin) chỉ dành riêng cho tài khoản có vai trò{' '}
              <strong className="text-purple-400">ROLE ADMIN</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Tài khoản hiện tại:</span>
              <span className="font-bold text-slate-200">{currentUser?.name || 'Khách vãng lai'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vai trò hiện tại:</span>
              <span className="font-bold text-amber-400 font-mono">{currentUser?.role || 'GUEST'}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigateTo('login')}
              className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Đăng Nhập Tài Khoản Quản Trị Viên</span>
            </button>

            <button
              onClick={() => {
                if (currentUser?.role === 'STAFF') {
                  navigateTo('staff-dashboard');
                } else {
                  navigateTo('home');
                }
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay Lại Giao Diện Của Bạn</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Derive active tab from currentView
  let activeTab = 'dashboard';
  if (currentView.startsWith('admin-')) {
    activeTab = currentView.replace('admin-', '');
  } else if (currentView === 'admin') {
    activeTab = 'dashboard';
  }

  const handleTabChange = (tab: string) => {
    navigateTo(`admin-${tab}`);
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminOverviewView />;
      case 'users':
        return <AdminUsersView />;
      case 'students':
        return <AdminStudentsView />;
      case 'staff':
        return <AdminStaffView />;
      case 'canteens':
        return <AdminCanteensView />;
      case 'foods':
        return <AdminFoodsView />;
      case 'categories':
        return <AdminCategoriesView />;
      case 'orders':
        return <AdminOrdersView />;
      case 'tables':
        return <AdminTablesView />;
      case 'pickup-slots':
        return <AdminPickupSlotsView />;
      case 'dormitories':
        return <AdminDormitoriesView />;
      case 'promotions':
        return <AdminPromotionsView />;
      case 'reviews':
        return <AdminReviewsView />;
      case 'notifications':
        return <AdminNotificationsView />;
      case 'payments':
        return <AdminPaymentsView />;
      case 'statistics':
        return <AdminStatisticsView />;
      case 'settings':
        return <AdminSettingsView />;
      default:
        return <AdminOverviewView />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderActiveContent()}
    </AdminLayout>
  );
};
