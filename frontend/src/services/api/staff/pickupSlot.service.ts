import { apiClient } from '../client/apiClient';
import { ApiResponse, PickupSlot } from '../../../types/shared';

export class StaffPickupSlotService {
    // 4. Pickup Slots
    public async getPickupSlots(canteenId?: string): Promise<ApiResponse<PickupSlot[]>> {
        return apiClient.get('/staff/pickup-slots', { canteenId });
    }

    public async createPickupSlot(data: {
        canteenId: string;
        timeRange: string;
        maxOrders: number;
    }): Promise<ApiResponse<PickupSlot>> {
        return apiClient.post('/staff/pickup-slots', data);
    }

    public async updatePickupSlot(
        id: string,
        data: { timeRange?: string; maxOrders?: number; status?: string }
    ): Promise<ApiResponse<PickupSlot>> {
        return apiClient.put(`/staff/pickup-slots/${id}`, data);
    }

    public async deletePickupSlot(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(`/staff/pickup-slots/${id}`);
    }
}

export const staffPickupSlotService = new StaffPickupSlotService();