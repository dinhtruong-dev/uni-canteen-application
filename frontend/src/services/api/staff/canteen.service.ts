import { apiClient } from '../client/apiClient';
import type { ApiResponse } from '../../../types/shared/common.types';
import type { StaffCanteenInfo } from '../../../types/staff/dashboard.types';

export class StaffCanteenService {
    public async getCanteenInfo(canteenId: string = 'cant-a'): Promise<ApiResponse<StaffCanteenInfo>> {
        return apiClient.get('/staff/canteen', { canteenId });
    }

    public async updateCanteenInfo(
        canteenId: string,
        data: Partial<StaffCanteenInfo>
    ): Promise<ApiResponse<StaffCanteenInfo>> {
        return apiClient.put('/staff/canteen', { canteenId, ...data });
    }
}

export const staffCanteenService = new StaffCanteenService();
