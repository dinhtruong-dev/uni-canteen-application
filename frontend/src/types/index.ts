export type Role = 'STUDENT' | 'STAFF' | 'ADMIN';

export type OrderType = 'DINE_IN' | 'PICKUP' | 'DELIVERY';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'STUDENT_WALLET'
  | 'CASH'
  | 'VNPAY_QR'
  | 'MOMO'
  | 'E_GREEN'
  | 'APPLE_PAY'
  | 'SHOPEEPAY'
  | 'ZALOPAY'
  | 'CREDIT_CARD';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export interface DeliveryAddress {
  id?: string;
  label?: string;
  campus?: string;
  area?: string;
  building: string;
  floor?: string;
  room: string;
  phone?: string;
  notes?: string;
  note?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  studentId?: string;
  email: string;
  phone: string;
  role: Role;
  faculty?: string;
  department?: string;
  className?: string;
  gender?: string;
  dateOfBirth?: string;
  avatar: string;
  isEmailVerified?: boolean;
  walletBalance: number;
  savedAddresses: DeliveryAddress[];
  canteenId?: string; // For STAFF role
  status?: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

export interface Canteen {
  id: string;
  name: string;
  displayName?: string;
  code: string;
  location: string;
  distance?: string;
  duration?: string;
  openingHours: string;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  soldCount?: string;
  voucher?: string;
  freeship?: string;
  image: string;
  totalTables: number;
  phone: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  image?: string;
  description?: string;
  sortOrder?: number;
}

export interface FoodTopping {
  id: string;
  name: string;
  price: number;
}

export interface FoodSize {
  name: string;
  price: number;
}

export interface FoodItem {
  id: string;
  name: string;
  canteenId?: string;
  canteenName?: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  ingredients?: string[];
  isBestSeller?: boolean;
  isNew?: boolean;
  isVegetarian?: boolean;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  soldCount?: number;
  orderCount?: number;
  toppings?: FoodTopping[];
  sizes?: FoodSize[];
  preparationTime: number; // in minutes
}

export interface CartItem {
  id: string; // Unique cart item key
  food: FoodItem;
  quantity: number;
  selectedSize?: FoodSize;
  selectedToppings: FoodTopping[];
  notes?: string;
  unitPrice: number;
}

export interface TableInfo {
  id?: string;
  tableCode: string;
  canteenId: string;
  canteenName: string;
  tableName: string;
  tableNumber?: string;
  status: 'AVAILABLE' | 'OCCUPIED';
}

export interface TimeSlot {
  id: string;
  timeRange: string;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isAvailable: boolean;
}

export interface UserVoucher {
  id: string;
  userId: string;
  voucherId: string;
  isUsed: boolean;
  usedAt?: string;
  createdAt: string;
  voucher?: Promotion;
}

export interface TimelineEvent {
  status: OrderStatus;
  title: string;
  description?: string;
  time: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderCode?: string;
  userId: string;
  userName: string;
  userPhone: string;
  customerName?: string;
  customerPhone?: string;
  orderType: OrderType;
  canteenId: string;
  canteenName: string;
  voucherId?: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  estimatedTime?: string;
  tableInfo?: TableInfo;
  pickupTimeSlot?: string;
  deliveryAddress?: DeliveryAddress;
  notes?: string;
  qrCodeValue: string;
  timeline: TimelineEvent[];
}

export interface Review {
  id: string;
  orderId: string;
  foodId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  dateDisplay?: string;
  read: boolean;
  type: 'ORDER' | 'PROMO' | 'WALLET' | 'SYSTEM';
  linkOrderId?: string;
  actionText?: string;
  bannerImage?: string;
  iconEmoji?: string;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'TOPUP' | 'PAYMENT' | 'REFUND';
  description: string;
  date: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface CampusLocationNode {
  id: string;
  name: string;
  children?: CampusLocationNode[];
}

export interface BannerItem {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  badgeBg?: string;
  promoCode?: string;
  targetType?: 'PRODUCT' | 'CATEGORY' | 'EXTERNAL';
  targetId?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface FlashSaleItem {
  id: string;
  title: string;
  description?: string;
  productId: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  totalSlots: number;
  soldSlots: number;
  remainingSlots?: number;
  startTime: string;
  endTime: string;
  isOngoing?: boolean;
  food?: FoodItem;
}
