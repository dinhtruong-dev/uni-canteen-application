import { apiClient } from './apiClient';
import { Order, OrderStatus } from '../../types';

export class OrderService {
  public async getOrders(params?: Record<string, any>): Promise<any[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/orders', params);
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }

  public async getOrderById(id: string): Promise<any | null> {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/orders/${id}`);
    if (res?.success && res.data) {
      return res.data;
    }
    return null;
  }

  public async createOrder(orderPayload: any): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/orders', orderPayload);
    return res;
  }

  public async updateOrderStatus(id: string, status: OrderStatus): Promise<any> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(`/orders/${id}/status`, { status });
    return res;
  }

  public async cancelOrder(id: string, reason?: string): Promise<any> {
    const res = await apiClient.post<{ success: boolean; message: string }>(`/orders/${id}/cancel`, { reason });
    return res;
  }
}

export const orderService = new OrderService();
