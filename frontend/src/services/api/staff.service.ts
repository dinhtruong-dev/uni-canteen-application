import { apiClient } from './apiClient';

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

export interface StaffDashboardData {
  canteen: any;
  kpis: StaffKPIs;
  recentOrders: any[];
}

export class StaffService {
  // 1. Dashboard
  public async getDashboard(canteenId: string = 'cant-a'): Promise<{ success: boolean; data: StaffDashboardData }> {
    return apiClient.get('/staff/dashboard', { canteenId });
  }

  // 2. Orders
  public async getOrders(params: {
    canteenId?: string;
    receiveMethod?: string;
    status?: string;
    paymentStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    success: boolean;
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return apiClient.get('/staff/orders', params);
  }

  public async updateOrderStatus(
    orderId: string,
    status: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.patch(`/staff/orders/${orderId}/status`, { status, reason });
  }

  public async verifyPickup(
    code: string,
    canteenId?: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.post('/staff/orders/verify-pickup', { code, canteenId });
  }

  // 3. Pickup Slots
  public async getPickupSlots(canteenId?: string): Promise<{ success: boolean; data: any[] }> {
    return apiClient.get('/staff/pickup-slots', { canteenId });
  }

  public async createPickupSlot(data: {
    canteenId: string;
    timeRange: string;
    maxOrders: number;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post('/staff/pickup-slots', data);
  }

  public async updatePickupSlot(
    id: string,
    data: { timeRange?: string; maxOrders?: number; status?: string }
  ): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.put(`/staff/pickup-slots/${id}`, data);
  }

  public async deletePickupSlot(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/staff/pickup-slots/${id}`);
  }

  // 4. Tables & QR
  public async getTables(canteenId?: string): Promise<{ success: boolean; data: any[] }> {
    return apiClient.get('/staff/tables', { canteenId });
  }

  public async createTable(data: {
    tableNumber: string;
    canteenId?: string;
    capacity: number;
    area: string;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post('/staff/tables', data);
  }

  public async updateTable(
    id: string,
    data: { tableNumber?: string; capacity?: number; area?: string; status?: string }
  ): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.put(`/staff/tables/${id}`, data);
  }

  public async deleteTable(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/staff/tables/${id}`);
  }

  // 5. Foods (Menu Items)
  public async getFoods(params: {
    canteenId?: string;
    categoryId?: string;
    search?: string;
    isAvailable?: boolean | string;
  } = {}): Promise<{ success: boolean; total: number; data: any[] }> {
    return apiClient.get('/staff/foods', params);
  }

  public async createFood(data: any): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post('/staff/foods', data);
  }

  public async updateFood(id: string, data: any): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.put(`/staff/foods/${id}`, data);
  }

  public async deleteFood(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/staff/foods/${id}`);
  }

  public async toggleFoodStock(id: string, isAvailable: boolean): Promise<{ success: boolean; message: string }> {
    return apiClient.patch(`/menu/products/${id}/availability`, { isAvailable });
  }

  // 6. Categories
  public async getCategories(): Promise<{ success: boolean; total: number; data: any[] }> {
    return apiClient.get('/staff/categories');
  }

  public async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    image?: string;
    displayOrder?: number;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post('/staff/categories', data);
  }

  public async updateCategory(id: string, data: any): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.put(`/staff/categories/${id}`, data);
  }

  public async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/staff/categories/${id}`);
  }

  // 7. Promotions / Vouchers
  public async getPromotions(): Promise<{ success: boolean; total: number; data: any[] }> {
    return apiClient.get('/staff/promotions');
  }

  public async createPromotion(data: any): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post('/staff/promotions', data);
  }

  public async updatePromotion(id: string, data: any): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.put(`/staff/promotions/${id}`, data);
  }

  public async deletePromotion(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/staff/promotions/${id}`);
  }

  // 8. Reviews
  public async getReviews(params: { rating?: string | number; canteenId?: string } = {}): Promise<{
    success: boolean;
    total: number;
    data: any[];
  }> {
    return apiClient.get('/staff/reviews', params);
  }

  public async replyReview(id: string, replyText: string): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post(`/staff/reviews/${id}/reply`, { replyText });
  }

  // 9. Statistics
  public async getStatistics(canteenId: string = 'cant-a'): Promise<{ success: boolean; data: any }> {
    return apiClient.get('/staff/statistics', { canteenId });
  }

  // 10. Image Upload via Cloudinary
  public async uploadImage(base64Image: string): Promise<{ success: boolean; data?: { url: string } }> {
    return apiClient.post('/upload/image', { image: base64Image, folder: 'unieat_canteen' });
  }
}

export const staffService = new StaffService();
