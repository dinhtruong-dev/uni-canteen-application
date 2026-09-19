import React from 'react';
import { useApp } from '../store/AppContext';
import { HomeView } from '../pages/HomeView';
import { CategoryView } from '../pages/CategoryView';
import { FoodDetailView } from '../pages/FoodDetailView';
import { CartView } from '../pages/CartView';
import { CheckoutView } from '../pages/CheckoutView';
import { OrderSuccessView } from '../pages/OrderSuccessView';
import { MyOrdersView } from '../pages/MyOrdersView';
import { OrderTrackingView } from '../pages/OrderTrackingView';
import { ProfileView } from '../pages/ProfileView';
import { EditProfileView } from '../pages/EditProfileView';
import { FavoritesView } from '../pages/FavoritesView';
import { NotificationsView } from '../pages/NotificationsView';
import { SearchView } from '../pages/SearchView';
import { StaffDashboardView } from '../pages/StaffDashboardView';
import { AdminDashboardView } from '../pages/AdminDashboardView';
import { QRScannerView } from '../pages/QRScannerView';
import { FoodReviewsView } from '../pages/FoodReviewsView';
import { LoginView, RegisterView } from '../pages/AuthViews';

export const AppRoutes: React.FC = () => {
  const { currentView } = useApp();

  switch (currentView) {
    case 'home':
      return <HomeView />;
    case 'category':
      return <CategoryView />;
    case 'detail':
      return <FoodDetailView />;
    case 'cart':
      return <CartView />;
    case 'checkout':
      return <CheckoutView />;
    case 'order-success':
      return <OrderSuccessView />;
    case 'orders':
      return <MyOrdersView />;
    case 'order-tracking':
      return <OrderTrackingView />;
    case 'profile':
      return <ProfileView />;
    case 'edit-profile':
      return <EditProfileView />;
    case 'favorites':
      return <FavoritesView />;
    case 'notifications':
      return <NotificationsView />;
    case 'search':
      return <SearchView />;
    case 'staff':
      return <StaffDashboardView />;
    case 'admin':
      return <AdminDashboardView />;
    case 'qr-scanner':
      return <QRScannerView />;
    case 'reviews':
      return <FoodReviewsView />;
    case 'login':
      return <LoginView />;
    case 'register':
      return <RegisterView />;
    default:
      return <HomeView />;
  }
};
