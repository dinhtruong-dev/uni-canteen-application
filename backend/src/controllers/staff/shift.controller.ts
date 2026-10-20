import { Request, Response } from 'express';
import { shiftService } from '../../services/staff/shift.service';

export class ShiftController {
  public async checkIn(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const staffId = user?.id || req.body.staffId;
      const staffName = user?.name || req.body.staffName || 'Nhân viên';
      const { canteenId, shiftType, notes } = req.body;

      if (!staffId) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin nhân viên' });
      }

      const record = await shiftService.checkIn({
        staffId,
        staffName,
        canteenId,
        shiftType,
        notes,
      });

      return res.status(200).json({
        success: true,
        message: 'Điểm danh vào ca thành công',
        data: record,
      });
    } catch (err: any) {
      console.error('[ShiftController checkIn Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi điểm danh vào ca', error: err.message });
    }
  }

  public async checkOut(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const staffId = user?.id || req.body.staffId;
      const { notes } = req.body;

      if (!staffId) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin nhân viên' });
      }

      const record = await shiftService.checkOut({ staffId, notes });
      if (!record) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy ca trực cần kết thúc' });
      }

      return res.status(200).json({
        success: true,
        message: 'Kết thúc ca làm việc thành công',
        data: record,
      });
    } catch (err: any) {
      console.error('[ShiftController checkOut Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi kết thúc ca làm', error: err.message });
    }
  }

  public async getMyShifts(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const staffId = user?.id || (req.query.staffId as string);

      if (!staffId) {
        return res.status(400).json({ success: false, message: 'Thiếu mã nhân viên' });
      }

      const records = await shiftService.getStaffShifts(staffId);
      return res.status(200).json({
        success: true,
        total: records.length,
        data: records,
      });
    } catch (err: any) {
      console.error('[ShiftController getMyShifts Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi tải lịch sử ca trực', error: err.message });
    }
  }
}

export const shiftController = new ShiftController();
