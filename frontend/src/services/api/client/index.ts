export * from './apiClient';
export * from '../shared/menu.service';
export * from '../shared/marketing.service';
export * from '../shared/table.service';
export * from '../shared/order.service';
export * from '../shared/auth.service';
export * from '../shared/search.service';
export * from '../shared/canteen.service';
export * from '../shared/user.service';
export * from '../shared/cart.service';

// Staff Modular Services
export * from '../staff/canteen.service';
export * from '../staff/dashboard.service';
export * from '../staff/staffOrder.service';
export * from '../staff/pickupSlot.service';
export * from '../staff/table.service';
export * from '../staff/food.service';
export * from '../staff/category.service';
export * from '../staff/promotion.service';
export * from '../staff/review.service';
export * from '../staff/kds.service';

// Admin Services
export * from '../admin/admin.service';

// Re-export common API payload/response types
export * from '../../../types/staff/kds.types';
export * from '../../../types/admin/dashboard.types';
export * from '../../../types/shared/search.types';
