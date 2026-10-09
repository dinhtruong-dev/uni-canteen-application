import type { SelectedOptionSnapshot } from './cart.types';

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'SERVED'
    | 'WAITING_PICKUP'
    | 'DELIVERING'
    | 'COMPLETED'
    | 'CANCELLED';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type PaymentMethod = 'CASH' | 'MOMO' | 'VNPAY' | 'WALLET' | 'BANKING';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface CreateOrderItemDTO {
    productId: string;
    quantity: number;
    selectedOptionIds?: string[];
    selectedOptions?: SelectedOptionSnapshot[];
    notes?: string;
    productName?: string;
    productImage?: string;
    unitPrice?: number;
}

export interface CreateOrderDTO {
    id?: string;
    orderCode?: string;
    userId: string;
    userName?: string;
    userPhone?: string;
    canteenId?: string;
    canteenName?: string;
    items: CreateOrderItemDTO[];
    orderType: OrderType;
    paymentMethod: PaymentMethod;
    voucherCode?: string;
    voucherId?: string;
    tableId?: string;
    tableNumber?: string;
    pickupSlot?: string;
    deliveryAddressId?: string;
    deliveryAddressText?: string;
    notes?: string;
}

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
    voucherId?: string;
    deliveryFee: number;
    finalAmount: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
