import { apiClient } from '../client/apiClient';
import { DiningTable, ApiResponse } from '../../../types/shared';

export class StaffTableService {
    public async getTables(canteenId?: string): Promise<ApiResponse<DiningTable[]>> {
        return apiClient.get('/staff/tables', { canteenId });
    }

    public async createTable(data: {
        tableNumber: string;
        canteenId?: string;
        capacity: number;
        area: string;
        status?: string;
    }): Promise<ApiResponse<DiningTable>> {
        return apiClient.post('/staff/tables', data);
    }

    public async updateTable(
        id: string,
        data: { tableNumber?: string; capacity?: number; area?: string; status?: string }
    ): Promise<ApiResponse<DiningTable>> {
        return apiClient.put(`/staff/tables/${id}`, data);
    }

    public async deleteTable(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(`/staff/tables/${id}`);
    }

    public async cleanTable(id: string): Promise<ApiResponse<DiningTable>> {
        return apiClient.post(`/staff/tables/${id}/clean`);
    }
}

export const staffTableService = new StaffTableService();