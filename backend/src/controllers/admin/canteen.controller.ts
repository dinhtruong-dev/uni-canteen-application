import { Request, Response } from 'express';
import { canteenService } from '../../services/shared/canteen.service';

export class AdminCanteenController {
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

  public async toggleStatus(req: Request, res: Response) {
    try {
      const updated = await canteenService.toggleCanteenStatus(req.params.id);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy căng tin để cập nhật trạng thái',
        });
      }
      return res.json({
        success: true,
        message: `Đã cập nhật trạng thái hoạt động: ${updated.isOpen ? 'Mở cửa' : 'Đóng cửa'}`,
        data: typeof (updated as any)?.toJSON === 'function' ? (updated as any).toJSON() : updated,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật',
        error: error.message,
      });
    }
  }

  public async createCanteen(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tên căn tin' });
      }
      const canteen = await canteenService.createCanteen(req.body);
      return res.status(201).json({
        success: true,
        message: `Đã thêm căn tin "${canteen.name}" thành công!`,
        data: typeof (canteen as any)?.toJSON === 'function' ? (canteen as any).toJSON() : canteen,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Lỗi thêm căn tin', error: error.message });
    }
  }

  public async updateCanteen(req: Request, res: Response) {
    try {
      const canteen = await canteenService.updateCanteen(req.params.id, req.body);
      if (!canteen) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy căn tin để cập nhật' });
      }
      return res.json({
        success: true,
        message: `Đã cập nhật căn tin "${canteen.name}" thành công!`,
        data: typeof (canteen as any)?.toJSON === 'function' ? (canteen as any).toJSON() : canteen,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật căn tin', error: error.message });
    }
  }

  public async deleteCanteen(req: Request, res: Response) {
    try {
      const ok = await canteenService.deleteCanteen(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy căn tin để xóa' });
      }
      return res.json({ success: true, message: 'Đã xóa căn tin thành công' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa căn tin', error: error.message });
    }
  }
}

export const adminCanteenController = new AdminCanteenController();
