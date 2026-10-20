import { apiClient } from '../client/apiClient';
import { StaffOrder } from '../../../types/staff/order.types';
import { ApiResponse } from '../../../types/shared/common.types';

export class StaffOrderService {
    public async getOrders(params: {
        canteenId?: string;
        receiveMethod?: string;
        status?: string;
        paymentStatus?: string;
        search?: string;
        page?: number;
        limit?: number;
    } = {}): Promise<ApiResponse<StaffOrder[]>> {
        return apiClient.get('/staff/orders', params);
    }

    public async updateOrderStatus(
        orderId: string,
        status: string,
        reason?: string
    ): Promise<ApiResponse<StaffOrder>> {
        return apiClient.patch(`/staff/orders/${orderId}/status`, { status, reason });
    }

    public async verifyPickup(
        code: string,
        canteenId?: string
    ): Promise<ApiResponse<StaffOrder>> {
        return apiClient.post('/staff/orders/verify-pickup', { code, canteenId });
    }
}

export const staffOrderService = new StaffOrderService();