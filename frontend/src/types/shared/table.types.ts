import type { OrderStatus, TableStatus } from '../enums.types';

export interface DiningTable {
    id: string;
    tableNumber: string;
    canteenId: string;
    canteenName?: string;
    qrCode?: string;
    qrCodeValue?: string;
    capacity: number;
    area?: string;
    status: TableStatus;
    currentOrderId?: string;
    orderStatus?: OrderStatus;
    orderCode?: string;
    updatedAt?: string;
}

export interface TableRecord {
    id: string;
    tableNumber: string;
    canteenId: string;
    canteenName: string;
    capacity: number;
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
    qrCodeValue: string;
}
