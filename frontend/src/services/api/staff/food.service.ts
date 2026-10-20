import { apiClient } from '../client/apiClient';
import { FoodItem } from '../../../types/shared/food.types';
import { ApiResponse } from '../../../types/shared/common.types';

export class StaffFoodService {
    public async getFoods(params: {
        canteenId?: string;
        categoryId?: string;
        search?: string;
        isAvailable?: boolean | string;
    } = {}): Promise<{ success: boolean; total: number; data: FoodItem[]; message?: string }> {
        return apiClient.get('/staff/foods', params);
    }

    public async createFood(data: Partial<FoodItem>): Promise<ApiResponse<FoodItem>> {
        return apiClient.post('/staff/foods', data);
    }

    public async updateFood(id: string, data: Partial<FoodItem>): Promise<ApiResponse<FoodItem>> {
        return apiClient.put(`/staff/foods/${id}`, data);
    }

    public async deleteFood(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(`/staff/foods/${id}`);
    }

    public async toggleFoodStock(id: string, isAvailable: boolean): Promise<ApiResponse<FoodItem>> {
        return apiClient.patch(`/staff/foods/${id}/availability`, { isAvailable });
    }

    public async uploadProductImage(
        fileOrBase64: File | string,
        productId?: string
    ): Promise<{ success: boolean; url: string; message?: string }> {
        if (typeof fileOrBase64 === 'string') {
            const res = await apiClient.post<{ success: boolean; url: string; message?: string }>(
                '/upload/image',
                {
                    image: fileOrBase64,
                    folder: `uni-canteen/products/${productId || 'temp'}`,
                }
            );
            return res;
        }

        const formData = new FormData();
        formData.append('image', fileOrBase64);
        if (productId) {
            formData.append('productId', productId);
        }

        const token =
            localStorage.getItem('token') ||
            localStorage.getItem('unieat_token') ||
            localStorage.getItem('unieat_jwt');

        const res = await fetch('/api/staff/foods/upload-image', {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                'X-User-Id': 'user-staff-1',
            },
            body: formData,
        });

        const data = await res.json();
        return {
            success: data.success,
            url: data.url || data.data?.url || '',
            message: data.message,
        };
    }
}

export const staffFoodService = new StaffFoodService();