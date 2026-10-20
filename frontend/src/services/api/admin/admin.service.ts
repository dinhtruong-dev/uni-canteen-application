import { apiClient } from '../client/apiClient';
import type { AdminOverviewData, AdminStatisticsData } from '../../../types/admin/dashboard.types';

export class AdminService {
  public async getOverview(): Promise<{ success: boolean; data: AdminOverviewData }> {
    return apiClient.get('/admin/overview');
  }

  public async getStatistics(): Promise<{ success: boolean; data: AdminStatisticsData }> {
    return apiClient.get('/admin/statistics');
  }

  public async pushNotification(data: {
    target: 'ALL' | 'STUDENTS' | 'STAFF' | string;
    title: string;
    message: string;
    type?: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.post('/admin/notifications', data);
  }

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

  public async submitStudentReview(data: {
    targetType: 'PRODUCT' | 'CANTEEN';
    targetId: string;
    rating: number;
    comment: string;
    orderId?: string;
    userId?: string;
    userName?: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.post('/reviews', data);
  }
}

export const adminService = new AdminService();
