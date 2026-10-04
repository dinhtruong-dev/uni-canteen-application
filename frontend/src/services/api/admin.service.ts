import { apiClient } from './apiClient';

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

export class AdminService {
  // 1. Thống kê & Tổng quan từ CSDL MySQL
  public async getOverview(): Promise<{ success: boolean; data: AdminOverviewData }> {
    return apiClient.get('/admin/overview');
  }

  public async getStatistics(): Promise<{ success: boolean; data: AdminStatisticsData }> {
    return apiClient.get('/admin/statistics');
  }

  // 2. Phát thông báo từ Admin (lưu DB & phát Socket.IO)
  public async pushNotification(data: {
    target: 'ALL' | 'STUDENTS' | 'STAFF' | string;
    title: string;
    message: string;
    type?: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.post('/admin/notifications', data);
  }

  // 3. Quản lý đánh giá (Reviews)
  public async getReviews(params: {
    canteenId?: string;
    rating?: number | string;
  } = {}): Promise<{ success: boolean; total: number; data: any[] }> {
    return apiClient.get('/admin/reviews', params);
  }

  public async toggleReviewVisibility(id: string, status: 'VISIBLE' | 'HIDDEN'): Promise<{ success: boolean; message: string }> {
    return apiClient.patch(`/admin/reviews/${id}/visibility`, { status });
  }

  public async replyReview(id: string, replyText: string): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.post(`/admin/reviews/${id}/reply`, { replyText });
  }

  // 4. Sinh viên gửi đánh giá vào CSDL
  public async submitStudentReview(data: {
    targetType: 'PRODUCT' | 'CANTEEN';
    targetId: string;
    rating: number;
    comment: string;
    orderId?: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.post('/reviews', data);
  }
}

export const adminService = new AdminService();
