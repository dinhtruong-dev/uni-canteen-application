import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';

const router = Router();

// 1. Dashboard
router.get('/dashboard', (req, res) => staffController.getDashboard(req, res));

// 2. Orders Management
router.get('/orders', (req, res) => staffController.getOrders(req, res));
router.patch('/orders/:id/status', (req, res) => staffController.updateOrderStatus(req, res));
router.post('/orders/verify-pickup', (req, res) => staffController.verifyPickup(req, res));

// 3. Pickup Slots
router.get('/pickup-slots', (req, res) => staffController.getPickupSlots(req, res));
router.post('/pickup-slots', (req, res) => staffController.createPickupSlot(req, res));
router.put('/pickup-slots/:id', (req, res) => staffController.updatePickupSlot(req, res));
router.delete('/pickup-slots/:id', (req, res) => staffController.deletePickupSlot(req, res));

// 4. Tables & QR
router.get('/tables', (req, res) => staffController.getTables(req, res));
router.post('/tables', (req, res) => staffController.createTable(req, res));
router.put('/tables/:id', (req, res) => staffController.updateTable(req, res));
router.delete('/tables/:id', (req, res) => staffController.deleteTable(req, res));
router.post('/tables/:id/clean', (req, res) => staffController.cleanTable(req, res));

// 5. Foods
router.get('/foods', (req, res) => staffController.getFoods(req, res));
router.post('/foods', (req, res) => staffController.createFood(req, res));
router.put('/foods/:id', (req, res) => staffController.updateFood(req, res));
router.delete('/foods/:id', (req, res) => staffController.deleteFood(req, res));

// 6. Categories
router.get('/categories', (req, res) => staffController.getCategories(req, res));
router.post('/categories', (req, res) => staffController.createCategory(req, res));
router.put('/categories/:id', (req, res) => staffController.updateCategory(req, res));
router.delete('/categories/:id', (req, res) => staffController.deleteCategory(req, res));

// 7. Promotions / Vouchers
router.get('/promotions', (req, res) => staffController.getPromotions(req, res));
router.post('/promotions', (req, res) => staffController.createPromotion(req, res));
router.put('/promotions/:id', (req, res) => staffController.updatePromotion(req, res));
router.delete('/promotions/:id', (req, res) => staffController.deletePromotion(req, res));

// 8. Reviews
router.get('/reviews', (req, res) => staffController.getReviews(req, res));
router.post('/reviews/:id/reply', (req, res) => staffController.replyReview(req, res));

// 9. Statistics
router.get('/statistics', (req, res) => staffController.getStatistics(req, res));

export default router;
