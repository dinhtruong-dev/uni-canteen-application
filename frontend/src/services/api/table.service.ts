import { apiClient } from './apiClient';

export class TableService {
  public async getTables(params?: Record<string, any>): Promise<any[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/tables', params);
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }

  public async getTableByQr(qrCode: string): Promise<any | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any }>(`/tables/qr/${encodeURIComponent(qrCode)}`);
      if (res?.success && res.data) {
        return res.data;
      }
    } catch { }

    try {
      const postRes = await apiClient.post<{ success: boolean; data: any }>('/tables/scan-qr', { code: qrCode });
      if (postRes?.success && postRes.data) {
        return postRes.data;
      }
    } catch { }
    return null;
  }

  public async scanQr(code: string): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const res = await apiClient.post<any>('/tables/scan-qr', { code });
      return res;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Không tìm thấy thông tin bàn ăn' };
    }
  }

  public async updateTableStatus(id: string, status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING') {
    return apiClient.patch(`/tables/${id}/status`, { status });
  }

  public async createTable(data: any) {
    return apiClient.post('/staff/tables', data);
  }

  public async updateTable(id: string, data: any) {
    return apiClient.put(`/staff/tables/${id}`, data);
  }

  public async deleteTable(id: string) {
    return apiClient.delete(`/staff/tables/${id}`);
  }
}

export const tableService = new TableService();
