import { Request, Response } from 'express';
import { canteenService } from '../../services/shared/canteen.service';

export class CanteenController {
  public async getAllCanteens(_req: Request, res: Response) {
    try {
      const canteens = await canteenService.getAllCanteens();
      return res.json({
        success: true,
        total: canteens.length,
        data: canteens.map((c: any) => (typeof c?.toJSON === 'function' ? c.toJSON() : c)),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Không thể tải danh sách căng tin',
        error: error.message,
      });
    }
  }

  public async getCanteenById(req: Request, res: Response) {
    try {
      const canteen = await canteenService.getCanteenById(req.params.id);
      if (!canteen) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy căng tin',
        });
      }
      return res.json({
        success: true,
        data: typeof (canteen as any)?.toJSON === 'function' ? (canteen as any).toJSON() : canteen,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message,
      });
    }
  }
}

export const canteenController = new CanteenController();
