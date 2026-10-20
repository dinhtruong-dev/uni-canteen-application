import React from 'react';
import { useApp } from '../store/AppContext';
import {
  HomeView,
  CategoryView,
  FoodDetailView,
  FoodReviewsView,
  SectionListView,
  CartView,
  CheckoutView,
  OrderSuccessView,
  OrderTrackingView,
  MyOrdersView,
  FavoritesView,
  ProfileView,
  EditProfileView,
  NotificationsView,
  SearchView,
  QRScannerView,
  LoginView,
  RegisterView,
  ForgotPasswordView,
  DeliveryLocationView,
  SelectCanteenView,
} from '../pages/customer';
import { StaffPortalView } from '../pages/staff/Portal';
import { KitchenKDSView } from '../pages/staff/KitchenKDS';
import { AdminPortalView } from '../pages/admin/Portal';
import { AdminStaffLoginView } from '../pages/admin/StaffLogin';

export const AppRoutes: React.FC = () => {
  const { currentView, viewParams, currentUser } = useApp();

  // Luôn đưa màn hình về đầu trang khi chuyển view
  React.useEffect(() => {
    if (!viewParams?.preserveScroll && (viewParams?.scrollY === undefined || viewParams?.scrollY === null)) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [currentView]);

  // 1. Khi chưa đăng nhập: Luôn hiển thị màn hình đăng nhập tương ứng
  if (!currentUser) {
    if (
      currentView === 'admin-login' ||
      currentView === 'admin' ||
      currentView === 'admin/login' ||
      currentView.startsWith('admin-')
    ) {
      return <AdminStaffLoginView initialRole="ADMIN" />;
    }
    if (
      currentView === 'staff-login' ||
      currentView === 'staff' ||
      currentView === 'staff/login' ||
      currentView.startsWith('staff-')
    ) {
      return <AdminStaffLoginView initialRole="STAFF" />;
    }
    if (currentView === 'portal-login' || currentView === 'portal/login') {
      return <AdminStaffLoginView initialRole="ADMIN" />;
    }
    if (currentView === 'register' || currentView === 'buyer/register') {
      return <RegisterView />;
    }
    if (currentView === 'forgot-password') {
      return <ForgotPasswordView />;
    }
    return <LoginView />;
  }

  // 2. PHÂN QUYỀN ĐỘC LẬP THEO VAI TRÒ (STRICT ROLE ISOLATION)
  // ADMIN: Chỉ được phép vào giao diện Quản trị (Admin Portal), cấm tuyệt đối mọi giao diện khách hàng
  if (currentUser.role === 'ADMIN') {
    if (currentView === 'kitchen-kds' || currentView === 'kds' || currentView === 'kitchen') {
      return <KitchenKDSView />;
    }
    return <AdminPortalView />;
  }

  // STAFF: Chỉ được phép vào giao diện Bếp & Quầy (Staff Portal & KDS), cấm tuyệt đối mọi giao diện khách hàng
  if (currentUser.role === 'STAFF') {
    if (currentView === 'kitchen-kds' || currentView === 'kds' || currentView === 'kitchen') {
      return <KitchenKDSView />;
    }
    return <StaffPortalView />;
  }

  // 3. KHÁCH HÀNG (STUDENT / BUYER): Chỉ được phép vào giao diện khách hàng, chặn tuyệt đối trang Admin & Staff
  if (
    currentView.startsWith('admin') ||
    currentView.startsWith('staff') ||
    currentView === 'kitchen-kds' ||
    currentView === 'kds' ||
    currentView === 'kitchen'
  ) {
    return <HomeView />;
  }

  switch (currentView) {
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
    case 'login':
    case 'buyer/login':
      return <LoginView />;
    case 'admin-login':
    case 'admin/login':
      return <AdminStaffLoginView initialRole="ADMIN" />;
    case 'staff-login':
    case 'staff/login':
      return <AdminStaffLoginView initialRole="STAFF" />;
    case 'portal-login':
    case 'portal/login':
      return <AdminStaffLoginView initialRole="ADMIN" />;
    case 'register':
    case 'buyer/register':
      return <RegisterView />;
    case 'forgot-password':
      return <ForgotPasswordView />;
    default:
      return <HomeView />;
  }
};
