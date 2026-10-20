import { apiClient } from '../client/apiClient';
import { ApiResponse } from '../../../types/shared/common.types';
import { StaffDashboardData, StaffStatisticsData, StaffCanteenInfo } from '../../../types/staff';

export class StaffDashboardService {
    // 1. Dashboard
    public async getDashboard(canteenId: string = 'cant-a'): Promise<ApiResponse<StaffDashboardData>> {
        return apiClient.get('/staff/dashboard', { canteenId });
    }

    public async getCanteenInfo(canteenId: string = 'cant-a'): Promise<ApiResponse<StaffCanteenInfo>> {
        return apiClient.get('/staff/canteen', { canteenId });
    }

    public async updateCanteenInfo(
        canteenId: string,
        data: Partial<StaffCanteenInfo>
    ): Promise<ApiResponse<StaffCanteenInfo>> {
        return apiClient.put('/staff/canteen', { canteenId, ...data });
    }

    public async getStatistics(canteenId: string = 'cant-a'): Promise<ApiResponse<StaffStatisticsData>> {
        return apiClient.get('/staff/statistics', { canteenId });
    }
}

export const staffDashboardService = new StaffDashboardService();