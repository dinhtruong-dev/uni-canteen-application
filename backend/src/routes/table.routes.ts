import { Router } from 'express';
import { tableController } from '../controllers/table.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Lấy danh sách bàn ăn từ MySQL CSDL
router.get('/', (req, res) => tableController.getAllTables(req, res));

// Quét & tra cứu mã QR bàn ăn (hỗ trợ cả param, query string, và POST body)
router.get('/qr', (req, res) => tableController.findByQr(req, res));
router.get('/qr/:code', (req, res) => tableController.findByQr(req, res));
router.post('/scan-qr', (req, res) => tableController.findByQr(req, res));

// Chi tiết bàn ăn
router.get('/:id', (req, res) => tableController.getTableById(req, res));

// Cập nhật trạng thái bàn ăn (Trống / Có khách / Đặt trước / Bảo trì)
router.patch('/:id/status', authMiddleware, (req, res) => tableController.updateStatus(req, res));

// Thao tác quản lý bàn ăn (Admin & Nhân viên)
router.post('/', authMiddleware, (req, res) => tableController.createTable(req, res));
router.put('/:id', authMiddleware, (req, res) => tableController.updateTable(req, res));
router.delete('/:id', authMiddleware, (req, res) => tableController.deleteTable(req, res));

export default router;
