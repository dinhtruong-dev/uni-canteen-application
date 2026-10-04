import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';

const router = Router();

// 1. Thống kê tổng quan & chuyên sâu
router.get('/overview', (req, res) => adminController.getOverview(req, res));
router.get('/statistics', (req, res) => adminController.getStatistics(req, res));

// 2. Phát thông báo (Lưu DB & Bắn Socket.IO)
router.post('/notifications', (req, res) => adminController.pushNotification(req, res));

// 3. Quản lý Đánh giá (Tương tác DB)
router.get('/reviews', (req, res) => adminController.getReviews(req, res));
router.patch('/reviews/:id/visibility', (req, res) => adminController.toggleReviewVisibility(req, res));
router.post('/reviews/:id/reply', (req, res) => adminController.replyReview(req, res));

export default router;
