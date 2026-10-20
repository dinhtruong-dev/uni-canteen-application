import { apiClient } from '../client/apiClient';
import type { KDSOrder, KDSProduct, KDSSummary } from '../../../types/staff/kds.types';

export class KDSService {
  public async getKDSOrders(canteenId?: string): Promise<{ orders: KDSOrder[]; summary?: KDSSummary }> {
    try {
      const params: Record<string, any> = {};
      if (canteenId && canteenId !== 'ALL') {
        params.canteenId = canteenId;
      }
      const res = await apiClient.get<any>('/orders/kds/live', params);
      if (res && res.success && Array.isArray(res.data)) {
        return { orders: res.data, summary: res.summary };
      }
    } catch (err) {
      console.warn('Failed to load KDS orders from backend:', err);
    }
    return { orders: [] };
  }

  public async getKDSHistory(canteenId?: string): Promise<KDSOrder[]> {
    try {
      const params: Record<string, any> = {};
      if (canteenId && canteenId !== 'ALL') {
        params.canteenId = canteenId;
      }
      const res = await apiClient.get<any>('/orders/kds/history', params);
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to load KDS order history from backend:', err);
    }
    return [];
  }

  public async callCustomer(orderId: string): Promise<boolean> {
    try {
      const res = await apiClient.post<any>(`/orders/kds/${orderId}/call-customer`);
      return Boolean(res && res.success);
    } catch (err) {
      console.warn('Failed to call customer for order pickup:', err);
      return false;
    }
  }

  public async updateKDSStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const res = await apiClient.patch<any>(`/orders/kds/${orderId}/status`, { status });
      return Boolean(res && res.success);
    } catch (err) {
      console.warn('Failed to update order status via KDS API:', err);
      return false;
    }
  }

  public async getProducts(canteenId?: string): Promise<KDSProduct[]> {
    try {
      const params: Record<string, any> = {};
      if (canteenId && canteenId !== 'ALL') {
        params.canteenId = canteenId;
      }
      const res = await apiClient.get<any>('/menu/products', params);
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to load products for KDS stock control:', err);
    }
    return [];
  }

  public async toggleProductAvailability(productId: string, isAvailable?: boolean): Promise<boolean> {
    try {
      const res = await apiClient.patch<any>(`/menu/products/${productId}/availability`, { isAvailable });
      return Boolean(res && res.success);
    } catch (err) {
      console.warn('Failed to toggle product availability via KDS API:', err);
      return false;
    }
  }
}

export const kdsService = new KDSService();
