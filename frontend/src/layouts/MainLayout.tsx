import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { BottomNavigation } from '../components/BottomNavigation';
import { WalletTopUpModal } from '../components/WalletTopUpModal';
import { ToastContainer } from '../components/ToastContainer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentView, currentUser, walletModalOpen, setWalletModalOpen } = useApp();
  const isAuthPage =
    !currentUser ||
    currentView === 'login' ||
    currentView === 'buyer/login' ||
    currentView === 'register' ||
    currentView === 'buyer/register' ||
    currentView === 'forgot-password';
  const isCheckoutPage = currentView === 'checkout';
  const isKDS = currentView === 'kds' || currentView === 'kitchen-kds' || currentView === 'kitchen';
  const isStaff = currentView.startsWith('staff');
  const isAdmin = currentView.startsWith('admin');

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center">
        <ToastContainer />
        <main className="w-full">
          {children}
        </main>
      </div>
    );
  }

  // 1. Màn hình KDS Bếp
  if (isKDS) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-slate-950">
        <ToastContainer />
        {children}
      </div>
    );
  }

  // 2. Phân hệ Quản trị Admin: Giao diện độc lập hoàn toàn, không có taskbar khách hàng
  if (currentUser?.role === 'ADMIN' || isAdmin) {
    return (
      <div className="w-full h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col">
        <ToastContainer />
        {children}
      </div>
    );
  }

  // 3. Phân hệ Bếp & Quầy Staff: Giao diện độc lập hoàn toàn, không có taskbar khách hàng
  if (currentUser?.role === 'STAFF' || isStaff) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <ToastContainer />
        {children}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen text-slate-900 flex flex-col font-sans selection:bg-[#22c3d3] selection:text-white ${
        isCheckoutPage ? 'bg-white' : 'bg-slate-50'
      }`}
    >
      <ToastContainer />

      {/* Main Content Area */}
      <main
        className={
          isCheckoutPage
            ? 'flex-1 w-full mx-auto p-0 pb-0'
            : 'flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 pb-24 lg:pb-12'
        }
      >
        {children}
      </main>

      {/* Bottom Task Bar / Navigation Bar */}
      <BottomNavigation />

      {/* Global Modals */}
      <WalletTopUpModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </div>
  );
};
