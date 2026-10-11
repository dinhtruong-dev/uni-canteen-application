import type { TableStatus } from './enums.types';

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
    slug?: string;
    image?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export interface TableInfo {
    id?: string;
    tableCode: string;
    canteenId: string;
    canteenName: string;
    tableName: string;
    tableNumber?: string;
    status: TableStatus;
}

export interface TimeSlot {
    id: string;
    timeRange: string;
    capacity: number;
    bookedCount: number;
    isAvailable: boolean;
}