import { Router } from 'express';
import multer from 'multer';
import { staffController } from '../controllers/staff.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

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
router.use(authMiddleware);
router.use(roleMiddleware('STAFF', 'ADMIN'));

// 1. Canteen Settings & Info
router.get('/canteen', (req, res) => staffController.getCanteen(req, res));
router.put('/canteen', (req, res) => staffController.updateCanteen(req, res));

// 2. Dashboard & Statistics
router.get('/dashboard', (req, res) => staffController.getDashboard(req, res));
router.get('/statistics', (req, res) => staffController.getStatistics(req, res));

// 3. Orders Management
router.get('/orders', (req, res) => staffController.getOrders(req, res));
router.patch('/orders/:id/status', (req, res) => staffController.updateOrderStatus(req, res));
router.post('/orders/verify-pickup', (req, res) => staffController.verifyPickup(req, res));

// 4. Pickup Slots
router.get('/pickup-slots', (req, res) => staffController.getPickupSlots(req, res));
router.post('/pickup-slots', (req, res) => staffController.createPickupSlot(req, res));
router.put('/pickup-slots/:id', (req, res) => staffController.updatePickupSlot(req, res));
router.delete('/pickup-slots/:id', (req, res) => staffController.deletePickupSlot(req, res));

// 5. Dining Tables & QR
router.get('/tables', (req, res) => staffController.getTables(req, res));
router.post('/tables', (req, res) => staffController.createTable(req, res));
router.put('/tables/:id', (req, res) => staffController.updateTable(req, res));
router.delete('/tables/:id', (req, res) => staffController.deleteTable(req, res));
router.post('/tables/:id/clean', (req, res) => staffController.cleanTable(req, res));

// 6. Foods Management
router.get('/foods', (req, res) => staffController.getFoods(req, res));
router.post('/foods', (req, res) => staffController.createFood(req, res));
router.put('/foods/:id', (req, res) => staffController.updateFood(req, res));
router.delete('/foods/:id', (req, res) => staffController.deleteFood(req, res));
router.patch('/foods/:id/availability', (req, res) => staffController.toggleFoodStock(req, res));
router.post('/foods/upload-image', upload.single('image'), (req, res) =>
  staffController.uploadFoodImage(req, res)
);

// 7. Categories Management
router.get('/categories', (req, res) => staffController.getCategories(req, res));
router.post('/categories', (req, res) => staffController.createCategory(req, res));
router.put('/categories/:id', (req, res) => staffController.updateCategory(req, res));
router.delete('/categories/:id', (req, res) => staffController.deleteCategory(req, res));

// 8. Promotions / Vouchers
router.get('/promotions', (req, res) => staffController.getPromotions(req, res));
router.post('/promotions', (req, res) => staffController.createPromotion(req, res));
router.put('/promotions/:id', (req, res) => staffController.updatePromotion(req, res));
router.delete('/promotions/:id', (req, res) => staffController.deletePromotion(req, res));

// 9. Reviews & Feedbacks
router.get('/reviews', (req, res) => staffController.getReviews(req, res));
router.post('/reviews/:id/reply', (req, res) => staffController.replyReview(req, res));

export default router;