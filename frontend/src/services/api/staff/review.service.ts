import { apiClient } from '../client/apiClient';
import { StaffReview, ApiResponse } from '../../../types/shared';

export class StaffReviewService {
    public async getReviews(params: { rating?: string | number; canteenId?: string } = {}): Promise<{
        success: boolean;
        total: number;
        data: StaffReview[];
        message?: string;
    }> {
        return apiClient.get('/staff/reviews', params);
    }

    public async replyReview(id: string, replyText: string): Promise<ApiResponse<{ id: string; replyText: string }>> {
        return apiClient.post(`/staff/reviews/${id}/reply`, { replyText });
    }
}

export const staffReviewService = new StaffReviewService();