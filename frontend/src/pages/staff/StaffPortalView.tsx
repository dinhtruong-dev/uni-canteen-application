import React from 'react';
import { useApp } from '../../store/AppContext';
import { StaffLayout } from '../../layouts/StaffLayout/StaffLayout';
import { StaffDashboardView } from './StaffDashboardView';
import { StaffOrdersView } from './StaffOrdersView';
import { StaffFoodsView } from './StaffFoodsView';
import { StaffCategoriesView } from './StaffCategoriesView';
import { StaffTablesView } from './StaffTablesView';
import { StaffPickupSlotsView } from './StaffPickupSlotsView';
import { StaffPromotionsView } from './StaffPromotionsView';
import { StaffReviewsView } from './StaffReviewsView';
import { StaffNotificationsView } from './StaffNotificationsView';
import { StaffStatisticsView } from './StaffStatisticsView';

export const StaffPortalView: React.FC = () => {
  const { currentView, navigateTo } = useApp();

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
      case 'categories':
        return <StaffCategoriesView />;
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
