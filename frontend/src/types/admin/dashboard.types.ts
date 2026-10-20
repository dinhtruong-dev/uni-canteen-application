export interface AdminOverviewKPIs {
    totalRevenue: number;
    todayRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    cookingOrders: number;
    deliveringOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalStudents: number;
    totalStaff: number;
    totalTables: number;
    occupiedTables: number;
}

export interface AdminOverviewData {
    kpis: AdminOverviewKPIs;
    orderTypes: { order_type: string; count: number }[];
    statuses: { status: string; count: number }[];
    revenueTrends: { date: string; revenue: number; orders: number }[];
}

export interface AdminStatisticsData {
    canteens: {
        name: string;
        revenue: number;
        orders: number;
        cancelRate: number;
    }[];
    hourly: {
        hour: string;
        orders: number;
    }[];
}