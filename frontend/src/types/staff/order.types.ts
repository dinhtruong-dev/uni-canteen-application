import type { OrderStatus, OrderType } from '../enums.types';

export interface StaffOrderDetailItem {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    selectedOptionsJson?: string | string[];
    itemSubtotal: number;
    notes?: string;
}

export interface StaffOrder {
    id: string;
    orderCode: string;
    userId: string;
    userName: string;
    userPhone: string;
    canteenId: string;
    canteenName: string;
    voucherId?: string;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    status: OrderStatus;
    orderType: OrderType;
    tableId?: string;
    tableNumber?: string;
    pickupSlot?: string;
    pickupCode?: string;
    deliveryAddressId?: string;
    deliveryAddressText?: string;
    paymentMethod: string;
    isPaid: boolean;
    notes?: string;
    elapsedMinutes?: number;
    orderDetails?: StaffOrderDetailItem[];
    createdAt: string;
    updatedAt?: string;
}