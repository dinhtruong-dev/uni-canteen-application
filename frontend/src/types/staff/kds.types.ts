import type { OrderStatus, OrderType } from '../enums.types';

export interface KDSSelectedOption {
    groupId?: string;
    groupName?: string;
    optionId?: string;
    itemName: string;
    extraPrice?: number;
}

export interface KDSOrderDetailItem {
    id: string;
    productId: string;
    productName: string;
    productImage?: string;
    unitPrice: number;
    quantity: number;
    itemSubtotal: number;
    selectedOptions?: KDSSelectedOption[];
    notes?: string;
}

export interface KDSOrder {
    id: string;
    orderCode: string;
    userId: string;
    userName: string;
    userPhone: string;
    canteenId: string;
    canteenName: string;
    orderDetails: KDSOrderDetailItem[];
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    status: OrderStatus;
    orderType: OrderType;
    tableId?: string;
    tableNumber?: string;
    pickupSlot?: string;
    deliveryAddressText?: string;
    notes?: string;
    isPaid: boolean;
    createdAt: string;
    elapsedMinutes?: number;
}

export interface KDSProduct {
    id: string;
    name: string;
    price: number;
    canteenId: string;
    canteenName?: string;
    categoryName?: string;
    isAvailable: boolean;
    image?: string;
}

export interface KDSSummary {
    newCount: number;
    cookingCount: number;
    readyCount: number;
    completedCount: number;
}