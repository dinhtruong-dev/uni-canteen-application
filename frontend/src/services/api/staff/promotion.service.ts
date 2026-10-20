import { apiClient } from '../client/apiClient';
import { StaffPromotion, ApiResponse } from '../../../types/shared';

export class StaffPromotionService {
    public async getPromotions(): Promise<{ success: boolean; total: number; data: StaffPromotion[]; message?: string }> {
        return apiClient.get('/staff/promotions');
    }

    public async createPromotion(data: Partial<StaffPromotion>): Promise<ApiResponse<StaffPromotion>> {
        return apiClient.post('/staff/promotions', data);
    }

    public async updatePromotion(
        id: string,
        data: Partial<StaffPromotion>
    ): Promise<ApiResponse<StaffPromotion>> {
        return apiClient.put(`/staff/promotions/${id}`, data);
    }

    public async deletePromotion(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(`/staff/promotions/${id}`);
    }
}

export const staffPromotionService = new StaffPromotionService();