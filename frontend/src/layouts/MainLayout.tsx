import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { BottomNavigation } from '../components/BottomNavigation';
import { WalletTopUpModal } from '../components/WalletTopUpModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentView } = useApp();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const isLandingPage = currentView === 'landing';

  return (
    <div
      className={`min-h-screen text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white ${
        isLandingPage ? 'bg-slate-900' : 'bg-slate-50'
      }`}
    >
      {/* Main Content Area - không có Navbar/header thừa */}
      <main
        className={
          isLandingPage
            ? 'flex-1 w-full'
            : 'flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 pb-24 lg:pb-12'
        }
      >
        {children}
      </main>

      {/* Bottom Task Bar / Navigation Bar */}
      {!isLandingPage && <BottomNavigation />}

      {/* Global Modals */}
      <WalletTopUpModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
};
