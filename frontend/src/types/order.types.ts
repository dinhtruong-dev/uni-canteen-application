import type {
    OrderType,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
} from './enums.types';
import type { FoodSize, FoodTopping } from './food.types';
import type { TableInfo } from './canteen.types';
import type { DeliveryAddress } from './user.types';

export interface TimelineEvent {
    status: OrderStatus;
    title: string;
    description?: string;
    time: string;
    completed: boolean;
}

export interface OrderItem {
    id: string;
    foodId: string;
    foodName: string;
    foodImage: string;
    quantity: number;
    unitPrice: number;
    selectedSize?: FoodSize;
    selectedToppings: FoodTopping[];
    notes?: string;
    itemSubtotal: number;
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
    items: OrderItem[];
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