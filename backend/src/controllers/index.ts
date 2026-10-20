// ==============================================================================
// UNI-CANTEEN CONTROLLERS BARREL EXPORT (Root Folder)
// Cho phép import ngắn gọn: import { ... } from '../controllers' hoặc '../../controllers'
// ==============================================================================

// 1. Root Common Controllers
export * from './auth.controller';
export * from './user.controller';
export * from './upload.controller';

// 2. Admin Controllers
export * from './admin/dashboard.controller';
export * from './admin/userManagement.controller';
export * from './admin/systemConfig.controller';
export * from './admin/canteen.controller';
export * from './admin/report.controller';

// 3. Shared Controllers (Customer & General)
export * from './shared/cart.controller';
export * from './shared/order.controller';
export * from './shared/payment.controller';
export * from './shared/food.controller';
export * from './shared/category.controller';
export * from './shared/menu.controller';
export * from './shared/table.controller';
export * from './shared/promotion.controller';
export * from './shared/interaction.controller';
export * from './shared/search.controller';
export * from './shared/canteen.controller';

// 4. Staff Controllers
export * from './staff/shift.controller';
export * from './staff/staffOrder.controller';
export * from './staff/pickupSlot.controller';
export { staffDashboardController, StaffDashboardController } from './staff/dashboard.controller';
export { reviewController as staffReviewController, ReviewController as StaffReviewController } from './staff/review.controller';
export { canteenController as staffCanteenController, CanteenController as StaffCanteenController } from './staff/canteen.controller';
export { tableController as staffTableController, TableController as StaffTableController } from './staff/table.controller';
