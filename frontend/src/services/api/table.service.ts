import { apiClient } from './apiClient';
import { TableInfo } from '../../types';

export class TableService {
  public async getTables(params?: Record<string, any>): Promise<any[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/tables', params);
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }

  public async getTableByQr(qrCode: string): Promise<TableInfo | null> {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/tables/qr/${encodeURIComponent(qrCode)}`);
    if (res?.success && res.data) {
      return {
        tableCode: res.data.id || qrCode,
        tableName: res.data.tableNumber || 'Bàn ăn',
        canteenId: res.data.canteenId || 'cant-a',
        canteenName: res.data.canteenName || 'Căng tin A2',
        status: res.data.status || 'AVAILABLE',
      };
    }
    return null;
  }

  public async updateTableStatus(id: string, status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING') {
    return apiClient.patch(`/tables/${id}/status`, { status });
  }
}

export const tableService = new TableService();
