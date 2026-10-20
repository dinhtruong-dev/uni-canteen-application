import { apiClient } from '../client/apiClient';
import { FoodItem, ApiResponse } from '../../../types/shared';

export class FoodService {
    public async getFoods(params: {
        canteenId?: string;
        categoryId?: string;
        search?: string;
        isAvailable?: boolean | string;
    } = {}): Promise<ApiResponse<FoodItem[]>> {
        return apiClient.get('/foods', params);
    }

    public async createFood(data: Partial<FoodItem>): Promise<ApiResponse<FoodItem>> {
        return apiClient.post('/foods', data);
    }

}

export const foodService = new FoodService();