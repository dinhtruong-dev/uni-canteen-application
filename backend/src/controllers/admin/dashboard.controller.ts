import { Request, Response } from 'express';
import { adminDashboardService } from '../../services/admin/dashboard.service';

export class AdminDashboardController {
  public async getOverview(_req: Request, res: Response) {
    try {
      const data = await adminDashboardService.getOverview();
      return res.json({
        success: true,
        data,
      });
    } catch (err: any) {
      console.error('[AdminDashboardController getOverview Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi nạp dữ liệu thống kê từ CSDL',
        error: err.message,
      });
    }
  }

  public async getStatistics(_req: Request, res: Response) {
    try {
      const data = await adminDashboardService.getStatistics();
      return res.json({
        success: true,
        data,
      });
    } catch (err: any) {
      console.error('[AdminDashboardController getStatistics Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi nạp báo cáo thống kê chuyên sâu',
        error: err.message,
      });
    }
  }
}

export const adminDashboardController = new AdminDashboardController();
