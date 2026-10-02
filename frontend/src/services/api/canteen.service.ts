import { apiClient } from './apiClient';
import { Canteen } from '../../types';

export class CanteenApiService {
  public async getCanteens(): Promise<Canteen[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/canteens');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        displayName: c.displayName || c.name,
        code: c.code,
        location: c.location,
        distance: c.distance || '150m',
        duration: c.duration || '12 phút',
        openingHours: c.openingHours || '06:30 - 21:00',
        isOpen: c.isOpen !== false,
        rating: Number(c.rating) || 4.8,
        reviewCount: Number(c.reviewCount) || 100,
        soldCount: c.soldCount || '1.5K+',
        voucher: c.voucher || '120.000đ',
        freeship: c.freeship || 'Freeship 10.000đ',
        image: c.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
        totalTables: Number(c.totalTables) || 24,
        phone: c.phone || '0988 123 456',
      }));
    }
    return [];
  }

  public async getCanteenById(id: string): Promise<Canteen | null> {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/canteens/${id}`);
    if (res?.success && res.data) {
      const c = res.data;
      return {
        id: c.id,
        name: c.name,
        displayName: c.displayName || c.name,
        code: c.code,
        location: c.location,
        distance: c.distance || '150m',
        duration: c.duration || '12 phút',
        openingHours: c.openingHours || '06:30 - 21:00',
        isOpen: c.isOpen !== false,
        rating: Number(c.rating) || 4.8,
        reviewCount: Number(c.reviewCount) || 100,
        soldCount: c.soldCount || '1.5K+',
        voucher: c.voucher || '120.000đ',
        freeship: c.freeship || 'Freeship 10.000đ',
        image: c.image,
        totalTables: Number(c.totalTables) || 24,
        phone: c.phone || '0988 123 456',
      };
    }
    return null;
  }

  public async toggleStatus(id: string): Promise<Canteen | null> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(`/canteens/${id}/toggle-status`, {});
    if (res?.success && res.data) {
      return res.data as Canteen;
    }
    return null;
  }
}

export const canteenApiService = new CanteenApiService();
