import { apiClient } from './apiClient';
import { User, DeliveryAddress, WalletTransaction, Notification } from '../../types';

export class UserService {
  public async getUsers(): Promise<User[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/users');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        avatar: u.avatar || `https://images.unsplash.com/photo-${u.role === 'ADMIN' ? '1472099645785-5658abf4ff4e' : u.role === 'STAFF' ? '1544005313-94ddf0286df2' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&q=80&w=200`,
        studentId: u.studentId,
        faculty: u.faculty,
        department: u.department,
        walletBalance: Number(u.walletBalance) || 0,
        savedAddresses: [],
        createdAt: u.createdAt || new Date().toISOString(),
      }));
    }
    return [];
  }

  public async getCurrentUser(): Promise<User | null> {
    const res = await apiClient.get<{ success: boolean; data: any }>('/users/me');
    if (res?.success && res.data) {
      const u = res.data;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        studentId: u.studentId,
        faculty: u.faculty,
        department: u.department,
        walletBalance: Number(u.walletBalance) || 0,
        savedAddresses: [],
        createdAt: u.createdAt || new Date().toISOString(),
      };
    }
    return null;
  }

  public async getAddresses(): Promise<any[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/users/addresses');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((a: any) => ({
        id: a.id,
        recipientName: a.recipientName || a.recipient_name,
        recipientPhone: a.recipientPhone || a.recipient_phone,
        label: a.dormBlock || a.dorm_block || 'KTX',
        building: a.dormBlock || a.dorm_block || 'KTX',
        dormBlock: a.dormBlock || a.dorm_block || 'KTX',
        room: a.roomNumber || a.room_number || '',
        roomNumber: a.roomNumber || a.room_number || '',
        fullAddress: a.fullAddress || a.full_address || `${a.roomNumber || a.room || ''}, ${a.dormBlock || a.building || ''}`,
        note: a.notes,
        notes: a.notes,
        isDefault: Boolean(a.isDefault || a.is_default),
      }));
    }
    return [];
  }

  public async createAddress(data: {
    recipientName: string;
    recipientPhone: string;
    dormBlock: string;
    roomNumber: string;
    fullAddress?: string;
    notes?: string;
    isDefault?: boolean;
  }): Promise<any | null> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/users/addresses', data);
    if (res?.success && res.data) {
      const a = res.data;
      return {
        id: a.id,
        recipientName: a.recipientName || a.recipient_name,
        recipientPhone: a.recipientPhone || a.recipient_phone,
        label: a.dormBlock || a.dorm_block,
        building: a.dormBlock || a.dorm_block,
        dormBlock: a.dormBlock || a.dorm_block,
        room: a.roomNumber || a.room_number,
        roomNumber: a.roomNumber || a.room_number,
        fullAddress: a.fullAddress || a.full_address,
        note: a.notes,
        notes: a.notes,
        isDefault: Boolean(a.isDefault || a.is_default),
      };
    }
    return null;
  }

  public async deleteAddress(id: string): Promise<boolean> {
    const res = await apiClient.delete<{ success: boolean }>(`/users/addresses/${id}`);
    return Boolean(res?.success);
  }

  public async getFavorites(): Promise<string[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/users/favorites');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((f: any) => f.targetId);
    }
    return [];
  }

  public async toggleFavorite(targetType: 'PRODUCT' | 'CANTEEN', targetId: string) {
    return apiClient.post('/users/favorites/toggle', { targetType, targetId });
  }

  public async getWalletTransactions(): Promise<WalletTransaction[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/payments/wallet/transactions');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((tx: any) => ({
        id: tx.id,
        amount: Number(tx.amount) || 0,
        type: tx.type,
        description: tx.description,
        date: tx.date || new Date().toLocaleString('vi-VN'),
        status: tx.status,
      }));
    }
    return [];
  }

  public async topUpWallet(amount: number, method: string = 'MoMo'): Promise<{ newBalance: number } | null> {
    const res = await apiClient.post<{ success: boolean; data: { newBalance: number } }>('/payments/wallet/topup', {
      amount,
      method,
    });
    if (res?.success && res.data) {
      return res.data;
    }
    return null;
  }

  public async getNotifications(): Promise<Notification[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/notifications');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        dateDisplay: new Date(n.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        read: Boolean(n.isRead),
        type: n.type === 'ORDER_STATUS' ? 'ORDER' : n.type === 'PROMOTION' ? 'PROMO' : n.type,
        linkOrderId: n.referenceId,
        iconEmoji: n.type === 'ORDER_STATUS' ? '📦' : n.type === 'WALLET' ? '💳' : n.type === 'PROMOTION' ? '🎁' : '⚡',
      }));
    }
    return [];
  }

  public async markNotificationRead(id: string): Promise<boolean> {
    const res = await apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`, {});
    return Boolean(res?.success);
  }

  // Admin User Management
  public async createUser(userData: any): Promise<User | null> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/users', userData);
    if (res?.success && res.data) return res.data as User;
    return null;
  }

  public async updateUser(id: string, userData: any): Promise<User | null> {
    const res = await apiClient.put<{ success: boolean; data: any }>(`/users/${id}`, userData);
    if (res?.success && res.data) return res.data as User;
    return null;
  }

  public async deleteUser(id: string): Promise<boolean> {
    const res = await apiClient.delete<{ success: boolean }>(`/users/${id}`);
    return Boolean(res?.success);
  }

  public async toggleUserStatus(id: string): Promise<User | null> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(`/users/${id}/status`, {});
    if (res?.success && res.data) return res.data as User;
    return null;
  }

  public async adminTopUpWallet(id: string, amount: number): Promise<User | null> {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/users/${id}/wallet/topup`, { amount });
    if (res?.success && res.data) return res.data as User;
    return null;
  }
}

export const userService = new UserService();
