import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

import shiftRoutes from './shift.routes';
import staffOrderRoutes from './staffOrder.routes';
import pickupSlotRoutes from './pickupSlot.routes';

import {
  canteenController,
  staffDashboardController,
  tableController,
  foodController,
  categoryController,
  promotionController,
  reviewController,
} from '../../controllers/staff';

const staffRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận tệp hình ảnh!'));
    }
  },
});

// BẢO VỆ TẤT CẢ ROUTE STAFF: Bắt buộc đăng nhập & Vai trò STAFF hoặc ADMIN
staffRouter.use(authMiddleware);
staffRouter.use(roleMiddleware('STAFF', 'ADMIN'));

// 1. Chấm công
staffRouter.use('/shifts', shiftRoutes);

// 2. Tiếp nhận & xử lý đơn hàng
staffRouter.use('/orders', staffOrderRoutes);

// 3. Khung giờ nhận món
staffRouter.use('/pickup-slots', pickupSlotRoutes);

// 4. Canteen Settings & Info
staffRouter.get('/canteen', (req, res) => canteenController.getCanteen(req, res));
staffRouter.put('/canteen', (req, res) => canteenController.updateCanteen(req, res));

// 5. Dashboard & Statistics
staffRouter.get('/dashboard', (req, res) => staffDashboardController.getDashboard(req, res));
staffRouter.get('/statistics', (req, res) => staffDashboardController.getStatistics(req, res));

// 6. Dining Tables & QR
staffRouter.get('/tables', (req, res) => tableController.getTables(req, res));
staffRouter.post('/tables', (req, res) => tableController.createTable(req, res));
staffRouter.put('/tables/:id', (req, res) => tableController.updateTable(req, res));
staffRouter.delete('/tables/:id', (req, res) => tableController.deleteTable(req, res));
staffRouter.post('/tables/:id/clean', (req, res) => tableController.cleanTable(req, res));

// 7. Foods Management
staffRouter.get('/foods', (req, res) => foodController.getFoods(req, res));
staffRouter.post('/foods', (req, res) => foodController.createFood(req, res));
staffRouter.put('/foods/:id', (req, res) => foodController.updateFood(req, res));
staffRouter.delete('/foods/:id', (req, res) => foodController.deleteFood(req, res));
staffRouter.patch('/foods/:id/availability', (req, res) => foodController.toggleFoodStock(req, res));
staffRouter.post('/foods/upload-image', upload.single('image'), (req, res) =>
  foodController.uploadFoodImage(req, res)
);

// 8. Categories Management
staffRouter.get('/categories', (req, res) => categoryController.getCategories(req, res));
staffRouter.post('/categories', (req, res) => categoryController.createCategory(req, res));
staffRouter.put('/categories/:id', (req, res) => categoryController.updateCategory(req, res));
staffRouter.delete('/categories/:id', (req, res) => categoryController.deleteCategory(req, res));

// 9. Promotions / Vouchers
staffRouter.get('/promotions', (req, res) => promotionController.getPromotions(req, res));
staffRouter.post('/promotions', (req, res) => promotionController.createPromotion(req, res));
staffRouter.put('/promotions/:id', (req, res) => promotionController.updatePromotion(req, res));
staffRouter.delete('/promotions/:id', (req, res) => promotionController.deletePromotion(req, res));

// 10. Reviews & Feedbacks
staffRouter.get('/reviews', (req, res) => reviewController.getReviews(req, res));
staffRouter.post('/reviews/:id/reply', (req, res) => reviewController.replyReview(req, res));

export default staffRouter;
