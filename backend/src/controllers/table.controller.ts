import { Request, Response } from 'express';
import { tableService } from '../services/table.service';

export class TableController {
  public getAllTables(req: Request, res: Response) {
    const canteenId = req.query.canteenId as string;
    const tables = tableService.getAllTables(canteenId).map((t) => t.toJSON());
    res.json({ success: true, total: tables.length, data: tables });
  }

  public getTableById(req: Request, res: Response) {
    const table = tableService.getTableById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
    }
    res.json({ success: true, data: table.toJSON() });
  }

  public findByQr(req: Request, res: Response) {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Thiếu mã QR định danh' });
    }
    const table = tableService.findTableByQr(code);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Mã QR bàn ăn không hợp lệ' });
    }
    res.json({ success: true, data: table.toJSON() });
  }

  public updateStatus(req: Request, res: Response) {
    const { status, orderId } = req.body;
    const updated = tableService.updateTableStatus(req.params.id, status, orderId);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
    }
    res.json({ success: true, message: 'Cập nhật trạng thái bàn thành công', data: updated.toJSON() });
  }
}

export const tableController = new TableController();
