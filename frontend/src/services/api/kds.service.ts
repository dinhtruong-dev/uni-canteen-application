import { apiClient } from './apiClient';

export interface KDSOrderDetailItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  itemSubtotal: number;
  selectedOptions?: Array<{
    groupId?: string;
    groupName?: string;
    optionId?: string;
    itemName: string;
    extraPrice?: number;
  }>;
  notes?: string;
}

export interface KDSOrder {
  id: string;
  orderCode: string;
  userId: string;
  userName: string;
  userPhone: string;
  canteenId: string;
  canteenName: string;
  orderDetails: KDSOrderDetailItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  tableId?: string;
  tableNumber?: string;
  pickupSlot?: string;
  deliveryAddressText?: string;
  notes?: string;
  isPaid: boolean;
  createdAt: string;
  elapsedMinutes?: number;
}

export interface KDSProduct {
  id: string;
  name: string;
  price: number;
  canteenId: string;
  canteenName?: string;
  categoryName?: string;
  isAvailable: boolean;
  image?: string;
}

export interface KDSSummary {
  newCount: number;
  cookingCount: number;
  readyCount: number;
  completedCount: number;
}

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
