import { Request, Response } from 'express';
import { staffOrderService } from '../../services';
import { toPlain } from '../../utils/serialize';

export class StaffDashboardController {
    public async getDashboard(req: Request, res: Response) {
        try {
            const canteenId = (req.query.canteenId as string) || 'cant-a';
            const data = await staffOrderService.getDashboard(canteenId);

            return res.json({
                success: true,
                data: {
                    canteen: toPlain(data.canteen),
                    kpis: data.kpis,
                    recentOrders: data.recentOrders,
                    pendingOrders: data.pendingOrders,
                },
            });
        } catch (err: any) {
            console.error('[StaffDashboardController.getDashboard]', err);
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi tải thông tin Dashboard Staff' });
        }
    }

    public async getStatistics(req: Request, res: Response) {
        try {
            const canteenId = (req.query.canteenId as string) || 'cant-a';
            const data = await staffOrderService.getStatistics(canteenId);
            return res.json({ success: true, data });
        } catch (err: any) {
            console.error('[StaffDashboardController.getStatistics]', err);
            return res.status(500).json({ success: false, message: 'Lỗi tạo báo cáo thống kê' });
        }
    }
}

export const staffDashboardController = new StaffDashboardController();