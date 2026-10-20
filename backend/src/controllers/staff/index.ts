export { staffDashboardController, StaffDashboardController } from './dashboard.controller';
export { staffOrderController, StaffOrderController } from './staffOrder.controller';
export { shiftController, ShiftController } from './shift.controller';
export { pickupSlotController, PickupSlotController } from './pickupSlot.controller';
export { reviewController, ReviewController } from './review.controller';
export { canteenController, CanteenController } from './canteen.controller';
export { tableController, TableController } from './table.controller';

// Re-export shared controllers used in staff operations to maintain compatibility
export { foodController, FoodController } from '../shared/food.controller';
export { categoryController, CategoryController } from '../shared/category.controller';
export { promotionController, PromotionController } from '../shared/promotion.controller';