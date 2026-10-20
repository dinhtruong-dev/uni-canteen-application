import { Request, Response } from 'express';
import { pickupSlotService } from '../../services';
import { toPlainList } from '../../utils/serialize';

export class PickupSlotController {
    public async getPickupSlots(req: Request, res: Response) {
        try {
            const canteenId = req.query.canteenId as string;
            const slots = await pickupSlotService.getPickupSlots(canteenId);
            const data = toPlainList(slots);
            return res.json({ success: true, total: data.length, data });
        } catch (err: any) {
            console.warn('[PickupSlotController.getPickupSlots]', err.message);
            return res.json({ success: true, total: 0, data: [] });
        }
    }

    public async createPickupSlot(req: Request, res: Response) {
        try {
            const { canteenId = 'cant-a', timeRange, maxOrders = 25 } = req.body;
            if (!timeRange) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Vui lòng cung cấp khung giờ (VD: 11:30 - 11:45)' });
            }
            const slot = await pickupSlotService.createPickupSlot({
                canteenId,
                timeRange,
                maxOrders,
            });
            return res.status(201).json({
                success: true,
                message: 'Đã tạo khung giờ nhận món mới',
                data: toPlainList([slot])[0],
            });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: 'Lỗi tạo khung giờ nhận' });
        }
    }

    public async updatePickupSlot(req: Request, res: Response) {
        try {
            const { timeRange, maxOrders, status } = req.body;
            await pickupSlotService.updatePickupSlot(req.params.id, { timeRange, maxOrders, status });
            return res.json({
                success: true,
                message: 'Đã cập nhật khung giờ nhận món',
                data: { id: req.params.id },
            });
        } catch (err: any) {
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi cập nhật khung giờ nhận món' });
        }
    }

    public async deletePickupSlot(req: Request, res: Response) {
        try {
            await pickupSlotService.deletePickupSlot(req.params.id);
            return res.json({ success: true, message: 'Đã xóa khung giờ nhận món' });
        } catch (err: any) {
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi xóa khung giờ nhận món' });
        }
    }
}

export const pickupSlotController = new PickupSlotController();