export type Role = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface UserEntity {
  id: string;
  studentId?: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  faculty?: string;
  department?: string;
  walletBalance: number;
  avatar?: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderType = 'TAKE_AWAY' | 'DINE_IN' | 'DELIVERY';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CAMPUS_WALLET'
  | 'MOMO'
  | 'ZALOPAY'
  | 'VNPAY'
  | 'BANK_TRANSFER'
  | 'CASH';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface OrderEntity {
  id: string;
  orderCode: string;
  userId: string;
  canteenId: string;
  type: OrderType;
  tableNumber?: string;
  deliveryRoom?: string;
  timeSlot?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    selectedOptions?: Record<string, string>;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  finalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
