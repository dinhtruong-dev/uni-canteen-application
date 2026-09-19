import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNavigation } from './components/BottomNavigation';
import { ToastContainer } from './components/ToastContainer';
import { QRScannerModal } from './components/QRScannerModal';
import { WalletTopUpModal } from './components/WalletTopUpModal';

// Views
import { LandingView } from './views/LandingView';
import { HomeView } from './views/HomeView';
import { CategoryView } from './views/CategoryView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { MyOrdersView } from './views/MyOrdersView';
import { FavoritesView } from './views/FavoritesView';
import { ProfileView } from './views/ProfileView';
import { EditProfileView } from './views/EditProfileView';
import { FoodDetailView } from './views/FoodDetailView';
import { FoodReviewsView } from './views/FoodReviewsView';
import { SectionListView } from './views/SectionListView';
import { NotificationsView } from './views/NotificationsView';
import { LoginView, RegisterView, ForgotPasswordView } from './views/AuthViews';
import { StaffDashboardView } from './views/StaffDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { QRScannerView } from './views/QRScannerView';
import { SearchView } from './views/SearchView';

const MainLayout: React.FC = () => {
  const { currentView, viewParams, currentUser } = useApp();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const isLandingPage = currentView === 'landing';

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingView />;
      case 'home':
        return <HomeView />;
      case 'search':
        return <SearchView />;
      case 'qr-scanner':
        return <QRScannerView />;
      case 'category':
      case 'menu':
        return <CategoryView categoryId={viewParams?.category || viewParams?.categoryId} />;
      case 'food-detail':
        return <FoodDetailView foodId={viewParams.foodId} />;
      case 'food-reviews':
        return <FoodReviewsView foodId={viewParams.foodId} />;
      case 'section-list':
        return <SectionListView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-success':
        return <OrderSuccessView orderId={viewParams.orderId} />;
      case 'order-detail':
        return <OrderTrackingView orderId={viewParams.orderId} />;
      case 'orders':
        return <MyOrdersView />;
      case 'notifications':
        return <NotificationsView />;
      case 'favorites':
        return <FavoritesView />;
      case 'profile':
        return <ProfileView />;
      case 'edit-profile':
        return <EditProfileView />;
      case 'login':
        return <LoginView />;
      case 'register':
        return <RegisterView />;
      case 'forgot-password':
        return <ForgotPasswordView />;
      case 'staff-dashboard':
      case 'staff-foods':
      case 'staff-tables':
        return <StaffDashboardView />;
      case 'admin-dashboard':
      case 'admin-users':
      case 'admin-canteens':
        return <AdminDashboardView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className={`min-h-screen text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white ${isLandingPage ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Main Page Canvas Container */}
      <main className={isLandingPage ? 'flex-1 w-full' : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pb-24 lg:pb-12'}>
        {renderView()}
      </main>

      {/* Footer Branding (Hidden on Landing Page) */}
      {!isLandingPage && (
        <footer className="bg-white border-t border-slate-200/80 py-8 px-4 text-center text-xs text-slate-500 hidden lg:block">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-medium">
              © 2026 <strong className="text-slate-800">UniEat Campus System</strong>. Hệ thống đặt món căng tin trường đại học toàn diện.
            </p>
            <div className="flex items-center gap-4 font-semibold text-slate-600">
              <span>3 Hình thức: Quét QR Bàn • Nhận Khung Giờ • Giao Tận Phòng</span>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Navigation Bar (Hidden on Landing Page) */}
      {!isLandingPage && <BottomNavigation />}

      {/* Global Modals & Overlays */}
      <WalletTopUpModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
