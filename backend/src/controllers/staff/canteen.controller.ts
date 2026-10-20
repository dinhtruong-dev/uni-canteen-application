import { Request, Response } from 'express';
import { canteenService, redisService } from '../../services';
import { Canteen } from '../../models';
import { toPlain } from '../../utils/serialize';

export class CanteenController {
  public async getCanteen(req: Request, res: Response) {
    try {
      const canteenId = (req.query.canteenId as string) || 'cant-a';
      const canteen = await canteenService.getCanteenById(canteenId);
      if (!canteen) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy căn tin' });
      }
      return res.json({
        success: true,
        data: toPlain(canteen),
      });
    } catch (err: any) {
      console.error('[CanteenController.getCanteen Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi tải thông tin căn tin' });
    }
  }

  public async updateCanteen(req: Request, res: Response) {
    try {
      const canteenId = (req.body.canteenId || req.query.canteenId || 'cant-a') as string;
      const {
        displayName,
        location,
        openingHours,
        isOpen,
        phone,
        voucher,
        freeship,
        image,
      } = req.body;

      const canteen = await Canteen.findByPk(canteenId);
      if (!canteen) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy căn tin' });
      }

      const updateData: any = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (location !== undefined) updateData.location = location;
      if (openingHours !== undefined) updateData.openingHours = openingHours;
      if (isOpen !== undefined) updateData.isOpen = Boolean(isOpen);
      if (phone !== undefined) updateData.phone = phone;
      if (voucher !== undefined) updateData.voucher = voucher;
      if (freeship !== undefined) updateData.freeship = freeship;
      if (image !== undefined) updateData.image = image;

      await canteen.update(updateData);
      await redisService.delPrefix('canteens');

      return res.json({
        success: true,
        message: 'Cập nhật cấu hình căn tin thành công',
        data: toPlain(canteen),
      });
    } catch (err: any) {
      console.error('[CanteenController.updateCanteen Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật cấu hình căn tin' });
    }
  }
}

export const canteenController = new CanteenController();
