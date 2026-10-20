export interface PickupSlot {
    id: string;
    canteenId: string;
    timeRange: string;
    maxOrders: number;
    currentOrders: number;
    bookedCount?: number;
    capacity?: number;
    status?: 'AVAILABLE' | 'FULL' | 'DISABLED' | 'ACTIVE' | string;
    isAvailable?: boolean;
    createdAt?: string;
}

export type StaffPickupSlot = PickupSlot;