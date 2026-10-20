import type { StaffOrder } from './order.types';

export interface StaffKPIs {
    newOrders: number;
    preparing: number;
    waitingPickup: number;
    delivering: number;
    completedToday: number;
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
}

export interface StaffCanteenInfo {
    id: string;
    name: string;
    displayName: string;
    code: string;
    location: string;
    distance: string;
    duration: string;
    openingHours: string;
    isOpen: boolean;
    rating: number;
    reviewCount: number;
    soldCount?: string;
    voucher?: string;
    freeship?: string;
    image: string;
    totalTables: number;
    phone?: string;
}

export interface StaffDashboardData {
    canteen: StaffCanteenInfo | null;
    kpis: StaffKPIs;
    recentOrders: StaffOrder[];
    pendingOrders?: StaffOrder[];
}

export interface StaffDailyChartPoint {
    date: string;
    revenue: number;
    ordersCount: number;
}

export interface StaffTopProduct {
    id: string;
    name: string;
    image: string;
    quantity: number;
    revenue: number;
}

export interface StaffStatisticsData {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    methodBreakdown: {
        DINE_IN: { count: number; revenue: number };
        TAKEAWAY: { count: number; revenue: number };
        DELIVERY: { count: number; revenue: number };
    };
    dailyChart: StaffDailyChartPoint[];
    topProducts: StaffTopProduct[];
}