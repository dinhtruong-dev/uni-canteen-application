import { apiClient } from '../client/apiClient';
import type { Category, ApiResponse } from '../../../types/shared';

export class StaffCategoryService {
    // 7. Categories
    public async getCategories(): Promise<ApiResponse<Category[]>> {
        return apiClient.get('/staff/categories');
    }

    public async createCategory(data: {
        name: string;
        description?: string;
        icon?: string;
        image?: string;
        displayOrder?: number;
    }): Promise<ApiResponse<Category>> {
        return apiClient.post('/staff/categories', data);
    }

    public async updateCategory(
        id: string,
        data: Partial<Category>
    ): Promise<ApiResponse<Category>> {
        return apiClient.put(`/staff/categories/${id}`, data);
    }

    public async deleteCategory(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(`/staff/categories/${id}`);
    }
}

export const staffCategoryService = new StaffCategoryService();