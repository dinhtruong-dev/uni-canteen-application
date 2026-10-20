import { PickupSlot } from '../../models';

export class StaffPickupSlotService {
  public async getPickupSlots(canteenId?: string) {
    const where: any = {};
    if (canteenId) where.canteenId = canteenId;
    return PickupSlot.findAll({ where });
  }

  public async createPickupSlot(data: {
    canteenId?: string;
    timeRange: string;
    maxOrders?: number;
  }) {
    const id = `ps-${Date.now()}`;
    return PickupSlot.create({
      id,
      canteenId: data.canteenId || 'cant-a',
      timeRange: data.timeRange,
      maxOrders: Number(data.maxOrders) || 25,
      currentOrders: 0,
      status: 'AVAILABLE',
    });
  }

  public async updatePickupSlot(
    id: string,
    data: { timeRange?: string; maxOrders?: number; status?: string }
  ) {
    const updateData: any = {};
    if (data.timeRange) updateData.timeRange = data.timeRange;
    if (data.maxOrders !== undefined) updateData.maxOrders = Number(data.maxOrders);
    if (data.status) updateData.status = data.status;

    await PickupSlot.update(updateData, { where: { id } });
  }

  public async deletePickupSlot(id: string) {
    await PickupSlot.destroy({ where: { id } });
  }
}

export const staffPickupSlotService = new StaffPickupSlotService();
export const pickupSlotService = staffPickupSlotService;

