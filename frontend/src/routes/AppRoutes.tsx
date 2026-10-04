import React from 'react';
import { useApp } from '../store/AppContext';
import { LandingView } from '../pages/LandingView';
import { HomeView } from '../pages/HomeView';
import { CategoryView } from '../pages/CategoryView';
import { FoodDetailView } from '../pages/FoodDetailView';
import { FoodReviewsView } from '../pages/FoodReviewsView';
import { SectionListView } from '../pages/SectionListView';
import { CartView } from '../pages/CartView';
import { CheckoutView } from '../pages/CheckoutView';
import { OrderSuccessView } from '../pages/OrderSuccessView';
import { OrderTrackingView } from '../pages/OrderTrackingView';
import { MyOrdersView } from '../pages/MyOrdersView';
import { FavoritesView } from '../pages/FavoritesView';
import { ProfileView } from '../pages/ProfileView';
import { EditProfileView } from '../pages/EditProfileView';
import { NotificationsView } from '../pages/NotificationsView';
import { SearchView } from '../pages/SearchView';
import { StaffPortalView } from '../pages/staff/StaffPortalView';
import { AdminPortalView } from '../pages/admin/AdminPortalView';
import { QRScannerView } from '../pages/QRScannerView';
import { LoginView, RegisterView, ForgotPasswordView } from '../pages/AuthViews';
import { DeliveryLocationView } from '../pages/DeliveryLocationView';
import { SelectCanteenView } from '../pages/SelectCanteenView';
import { KitchenKDSView } from '../pages/KitchenKDSView';

export const AppRoutes: React.FC = () => {
  const { currentView, viewParams, currentUser } = useApp();

  // 1. Khi chưa đăng nhập: Luôn hiển thị màn hình đăng nhập (bỏ hoàn toàn landing page khi vào web)
  if (!currentUser) {
    if (currentView === 'register' || currentView === 'buyer/register') {
      return <RegisterView />;
    }
    if (currentView === 'forgot-password') {
      return <ForgotPasswordView />;
    }
    return <LoginView />;
  }

  // 2. Khi đã đăng nhập: Nếu đang ở màn hình login/register/landing thì tự động vào giao diện theo Role
  if (
    currentView === 'login' ||
    currentView === 'buyer/login' ||
    currentView === 'register' ||
    currentView === 'buyer/register' ||
    currentView === 'landing'
  ) {
    if (currentUser.role === 'ADMIN') {
      return <AdminPortalView />;
    }
    if (currentUser.role === 'STAFF') {
      return <StaffPortalView />;
    }
    return <HomeView />;
  }

  // 3. Phân quyền truy cập theo vai trò tài khoản
  if (currentView.startsWith('admin') && currentUser.role !== 'ADMIN') {
    return <HomeView />;
  }
  if (currentView.startsWith('staff') && currentUser.role !== 'STAFF' && currentUser.role !== 'ADMIN') {
    return <HomeView />;
  }
  if (currentUser.role === 'ADMIN' && currentView === 'home') {
    return <AdminPortalView />;
  }
  if (currentUser.role === 'STAFF' && currentView === 'home') {
    return <StaffPortalView />;
  }

  switch (currentView) {
    case 'landing':
      if (currentUser.role === 'ADMIN') return <AdminPortalView />;
      if (currentUser.role === 'STAFF') return <StaffPortalView />;
      return <HomeView />;
    case 'home':
      return <HomeView />;
    case 'select-delivery':
    case 'delivery-location':
      return <DeliveryLocationView />;
    case 'select-canteen':
    case 'pickup-canteen':
    case 'canteen-select':
      return <SelectCanteenView />;
    case 'search':
      return <SearchView />;
    case 'qr-scanner':
      return <QRScannerView />;
    case 'category':
    case 'menu':
    case 'canteen-menu':
      return (
        <CategoryView
          categoryId={viewParams?.category || viewParams?.categoryId}
          canteenId={viewParams?.canteenId || (viewParams?.canteen ? viewParams.canteen.id : undefined)}
        />
      );
    case 'detail':
    case 'food-detail':
      return <FoodDetailView foodId={viewParams?.foodId} />;
    case 'reviews':
    case 'food-reviews':
      return <FoodReviewsView foodId={viewParams?.foodId} />;
    case 'section-list':
      return <SectionListView />;
    case 'cart':
      return <CartView />;
    case 'checkout':
      return <CheckoutView />;
    case 'order-success':
      return <OrderSuccessView orderId={viewParams?.orderId} />;
    case 'orders':
      return <MyOrdersView />;
    case 'order-tracking':
    case 'order-detail':
      return <OrderTrackingView orderId={viewParams?.orderId} />;
    case 'profile':
      return <ProfileView />;
    case 'edit-profile':
      return <EditProfileView />;
    case 'favorites':
      return <FavoritesView />;
    case 'notifications':
      return <NotificationsView />;
    case 'staff':
    case 'staff-dashboard':
    case 'staff-orders':
    case 'staff-foods':
    case 'staff-categories':
    case 'staff-tables':
    case 'staff-pickup-slots':
    case 'staff-promotions':
    case 'staff-reviews':
    case 'staff-notifications':
    case 'staff-statistics':
      return <StaffPortalView />;
    case 'kds':
    case 'kitchen-kds':
    case 'kitchen':
      return <KitchenKDSView />;
    case 'admin':
    case 'admin-dashboard':
    case 'admin-users':
    case 'admin-students':
    case 'admin-staff':
    case 'admin-canteens':
    case 'admin-foods':
    case 'admin-categories':
    case 'admin-orders':
    case 'admin-tables':
    case 'admin-pickup-slots':
    case 'admin-dormitories':
    case 'admin-promotions':
    case 'admin-reviews':
    case 'admin-notifications':
    case 'admin-payments':
    case 'admin-statistics':
    case 'admin-settings':
      return <AdminPortalView />;
    case 'login':
    case 'buyer/login':
      return <LoginView />;
    case 'register':
    case 'buyer/register':
      return <RegisterView />;
    case 'forgot-password':
      return <ForgotPasswordView />;
    default:
      return <HomeView />;
  }
};
