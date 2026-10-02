import { Request, Response } from 'express';
import { canteenService } from '../services/canteen.service';

export class CanteenController {
  public getAllCanteens(_req: Request, res: Response) {
    try {
      const canteens = canteenService.getAllCanteens();
      return res.json({
        success: true,
        total: canteens.length,
        data: canteens.map((c) => c.toJSON()),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Không thể tải danh sách căng tin',
        error: error.message,
      });
    }
  }

  public getCanteenById(req: Request, res: Response) {
    try {
      const canteen = canteenService.getCanteenById(req.params.id);
      if (!canteen) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy căng tin',
        });
      }
      return res.json({
        success: true,
        data: canteen.toJSON(),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ',
        error: error.message,
      });
    }
  }

  public toggleStatus(req: Request, res: Response) {
    try {
      const updated = canteenService.toggleCanteenStatus(req.params.id);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy căng tin để cập nhật trạng thái',
        });
      }
      return res.json({
        success: true,
        message: `Đã cập nhật trạng thái hoạt động: ${updated.isOpen ? 'Mở cửa' : 'Đóng cửa'}`,
        data: updated.toJSON(),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật',
        error: error.message,
      });
    }
  }
}

export const canteenController = new CanteenController();
