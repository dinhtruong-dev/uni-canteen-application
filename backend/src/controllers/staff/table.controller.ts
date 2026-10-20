import { Request, Response } from 'express';
import { tableService, socketService } from '../../services';
import { toPlain } from '../../utils/serialize';

export class TableController {
    public async getTables(req: Request, res: Response) {
        try {
            const canteenId = req.query.canteenId as string;
            const tables = await tableService.getAllTables(canteenId);
            return res.json({ success: true, total: tables.length, data: tables });
        } catch (err: any) {
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi tải danh sách bàn từ CSDL' });
        }
    }

    public async createTable(req: Request, res: Response) {
        try {
            const {
                tableNumber,
                canteenId = 'cant-a',
                capacity = 4,
                area = 'Khu vực chính',
                qrCode,
                status,
            } = req.body;

            if (!tableNumber) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Vui lòng nhập tên/số bàn (VD: Bàn 09)' });
            }

            const newTable = await tableService.createTable({
                tableNumber,
                canteenId,
                capacity,
                area,
                qrCode,
                status,
            });

            return res.status(201).json({
                success: true,
                message: 'Đã tạo bàn ăn & mã QR mới thành công',
                data: toPlain(newTable),
            });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: 'Lỗi tạo bàn ăn mới' });
        }
    }

    public async updateTable(req: Request, res: Response) {
        try {
            const updated = await tableService.updateTable(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
            }
            return res.json({
                success: true,
                message: 'Đã cập nhật thông tin bàn ăn thành công',
                data: toPlain(updated),
            });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: 'Lỗi cập nhật bàn ăn' });
        }
    }

    public async deleteTable(req: Request, res: Response) {
        try {
            const ok = await tableService.deleteTable(req.params.id);
            if (!ok) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
            }
            return res.json({ success: true, message: 'Đã xóa bàn ăn khỏi CSDL thành công' });
        } catch (err: any) {
            return res.status(500).json({ success: false, message: 'Lỗi xóa bàn ăn' });
        }
    }

    public async cleanTable(req: Request, res: Response) {
        try {
            const table = await tableService.updateTableStatus(req.params.id, 'AVAILABLE' as any);
            if (!table) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bàn ăn' });
            }

            socketService.emitTableStatus({
                tableNumber: table.tableNumber,
                isOccupied: false,
            });

            return res.json({
                success: true,
                message: `Đã dọn dẹp và làm sạch ${table.tableNumber} thành công. Bàn hiện đã sẵn sàng đón khách mới!`,
                data: toPlain(table),
            });
        } catch (err: any) {
            console.error('[TableController.cleanTable]', err);
            return res.status(500).json({ success: false, message: 'Lỗi làm sạch bàn ăn' });
        }
    }
}

export const tableController = new TableController();