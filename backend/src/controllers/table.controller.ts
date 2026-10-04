import { Request, Response } from 'express';
import { tableService } from '../services/table.service';

export class TableController {
  public async getAllTables(req: Request, res: Response) {
    try {
      const canteenId = req.query.canteenId as string;
      const rawTables = await tableService.getAllTables(canteenId);
      const tables = rawTables.map((t: any) =>
        typeof t?.toJSON === 'function' ? t.toJSON() : t
      );
      res.json({ success: true, total: tables.length, data: tables });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải danh sách bàn từ CSDL', error: err.message });
    }
  }

  public async getTableById(req: Request, res: Response) {
    try {
      const table = await tableService.getTableById(req.params.id);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
      }
      res.json({
        success: true,
        data: typeof (table as any)?.toJSON === 'function' ? (table as any).toJSON() : table,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải chi tiết bàn', error: err.message });
    }
  }

  public async findByQr(req: Request, res: Response) {
    try {
      const code = (req.params.code || req.query.code || req.body?.code || req.body?.qrCode) as string;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Thiếu mã QR hoặc mã định danh bàn ăn' });
      }
      const table = await tableService.findTableByQr(code);
      if (!table) {
        return res.status(404).json({ success: false, message: `Không tìm thấy bàn ăn với mã "${code}"` });
      }
      res.json({
        success: true,
        message: `Đã tìm thấy ${table.tableNumber}`,
        data: typeof (table as any)?.toJSON === 'function' ? (table as any).toJSON() : table,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi quét QR bàn', error: err.message });
    }
  }

  public async updateStatus(req: Request, res: Response) {
    try {
      const { status, orderId } = req.body;
      const updated = await tableService.updateTableStatus(req.params.id, status, orderId);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
      }
      res.json({
        success: true,
        message: 'Cập nhật trạng thái bàn thành công',
        data: typeof (updated as any)?.toJSON === 'function' ? (updated as any).toJSON() : updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái bàn', error: err.message });
    }
  }

  public async createTable(req: Request, res: Response) {
    try {
      const { tableNumber, canteenId, canteenName, capacity, area, qrCode, status } = req.body;
      if (!tableNumber) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tên/số bàn ăn (VD: Bàn 09)' });
      }
      const table = await tableService.createTable({
        tableNumber,
        canteenId,
        canteenName,
        capacity,
        area,
        qrCode,
        status,
      });
      res.status(201).json({
        success: true,
        message: 'Đã tạo bàn ăn và mã QR thành công',
        data: typeof (table as any)?.toJSON === 'function' ? (table as any).toJSON() : table,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tạo bàn ăn', error: err.message });
    }
  }

  public async updateTable(req: Request, res: Response) {
    try {
      const updated = await tableService.updateTable(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
      }
      res.json({
        success: true,
        message: 'Cập nhật thông tin bàn ăn thành công',
        data: typeof (updated as any)?.toJSON === 'function' ? (updated as any).toJSON() : updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi cập nhật bàn ăn', error: err.message });
    }
  }

  public async deleteTable(req: Request, res: Response) {
    try {
      const ok = await tableService.deleteTable(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn cần xóa' });
      }
      res.json({ success: true, message: 'Đã xóa bàn ăn khỏi CSDL thành công' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi xóa bàn ăn', error: err.message });
    }
  }
}

export const tableController = new TableController();
