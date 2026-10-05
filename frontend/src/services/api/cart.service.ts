import { apiClient } from './apiClient';

export interface RedisCartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  basePrice: number;
  quantity: number;
  selectedOptions?: any[];
  notes?: string;
  unitPrice?: number;
  itemTotal?: number;
}

export interface RedisCart {
  id: string;
  userId: string;
  canteenId?: string;
  items: RedisCartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt: string;
}

export class CartApiService {
  /**
   * Lấy giỏ hàng từ Redis
   */
  public async getCart(): Promise<RedisCart | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: RedisCart }>('/cart');
      return res?.success ? res.data : null;
    } catch (err) {
      console.warn('[CartApiService] getCart warning:', err);
      return null;
    }
  }

  /**
   * Đồng bộ giỏ hàng lên Redis (Key: cart:userId, TTL: 7 ngày)
   */
  public async syncCart(items: any[]): Promise<RedisCart | null> {
    try {
      const res = await apiClient.post<{ success: boolean; data: RedisCart }>('/cart/sync', { items });
      return res?.success ? res.data : null;
    } catch (err) {
      console.warn('[CartApiService] syncCart warning:', err);
      return null;
    }
  }

  /**
   * Thêm một món vào giỏ hàng Redis
   */
  public async addItem(data: {
    productId: string;
    quantity?: number;
    selectedOptions?: any[];
    notes?: string;
  }): Promise<RedisCart | null> {
    try {
      const res = await apiClient.post<{ success: boolean; data: RedisCart }>('/cart/items', data);
      return res?.success ? res.data : null;
    } catch (err) {
      console.warn('[CartApiService] addItem warning:', err);
      return null;
    }
  }

  /**
   * Cập nhật số lượng món trong giỏ hàng Redis
   */
  public async updateItemQuantity(itemId: string, quantity: number): Promise<RedisCart | null> {
    try {
      const res = await apiClient.patch<{ success: boolean; data: RedisCart }>(`/cart/items/${itemId}`, { quantity });
      return res?.success ? res.data : null;
    } catch (err) {
      console.warn('[CartApiService] updateItemQuantity warning:', err);
      return null;
    }
  }

  /**
   * Xóa một món khỏi giỏ hàng Redis
   */
  public async removeItem(itemId: string): Promise<RedisCart | null> {
    try {
      const res = await apiClient.delete<{ success: boolean; data: RedisCart }>(`/cart/items/${itemId}`);
      return res?.success ? res.data : null;
    } catch (err) {
      console.warn('[CartApiService] removeItem warning:', err);
      return null;
    }
  }

  /**
   * Dọn dẹp / xóa trắng giỏ hàng trong Redis (sau khi đặt hàng thành công)
   */
  public async clearCart(): Promise<boolean> {
    try {
      const res = await apiClient.delete<{ success: boolean; message: string }>('/cart');
      return Boolean(res?.success);
    } catch (err) {
      console.warn('[CartApiService] clearCart warning:', err);
      return false;
    }
  }

  /**
   * Lấy danh sách khung giờ nhận món từ Database (pickup_slots)
   */
  public async getPickupSlots(canteenId?: string): Promise<any[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>('/pickup-slots', {
        canteenId: canteenId || 'cant-a',
      });
      return res?.success && Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.warn('[CartApiService] getPickupSlots warning:', err);
      return [];
    }
  }
}

export const cartApiService = new CartApiService();
export default cartApiService;
