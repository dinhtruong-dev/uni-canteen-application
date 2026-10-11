import type { FoodItem } from './food.types';

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