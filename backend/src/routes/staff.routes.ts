import { Router } from 'express';
import {
    staffDashboardController,
    staffOrderController,
    pickupSlotController,
    tableController,
    foodController,
    categoryController,
    promotionController,
    reviewController,
} from '../controllers/staff';

const router = Router();

// 1. Dashboard
router.get('/dashboard', (req, res) => staffDashboardController.getDashboard(req, res));
router.get('/statistics', (req, res) => staffDashboardController.getStatistics(req, res));

// 2. Orders Management
router.get('/orders', (req, res) => staffOrderController.getOrders(req, res));
router.patch('/orders/:id/status', (req, res) => staffOrderController.updateOrderStatus(req, res));
router.post('/orders/verify-pickup', (req, res) => staffOrderController.verifyPickup(req, res));

// 3. Pickup Slots
router.get('/pickup-slots', (req, res) => pickupSlotController.getPickupSlots(req, res));
router.post('/pickup-slots', (req, res) => pickupSlotController.createPickupSlot(req, res));
router.put('/pickup-slots/:id', (req, res) => pickupSlotController.updatePickupSlot(req, res));
router.delete('/pickup-slots/:id', (req, res) => pickupSlotController.deletePickupSlot(req, res));

// 4. Tables & QR
router.get('/tables', (req, res) => tableController.getTables(req, res));
router.post('/tables', (req, res) => tableController.createTable(req, res));
router.put('/tables/:id', (req, res) => tableController.updateTable(req, res));
router.delete('/tables/:id', (req, res) => tableController.deleteTable(req, res));
router.post('/tables/:id/clean', (req, res) => tableController.cleanTable(req, res));

// 5. Foods
router.get('/foods', (req, res) => foodController.getFoods(req, res));
router.post('/foods', (req, res) => foodController.createFood(req, res));
router.put('/foods/:id', (req, res) => foodController.updateFood(req, res));
router.delete('/foods/:id', (req, res) => foodController.deleteFood(req, res));

// 6. Categories
router.get('/categories', (req, res) => categoryController.getCategories(req, res));
router.post('/categories', (req, res) => categoryController.createCategory(req, res));
router.put('/categories/:id', (req, res) => categoryController.updateCategory(req, res));
router.delete('/categories/:id', (req, res) => categoryController.deleteCategory(req, res));

// 7. Promotions / Vouchers
router.get('/promotions', (req, res) => promotionController.getPromotions(req, res));
router.post('/promotions', (req, res) => promotionController.createPromotion(req, res));
router.put('/promotions/:id', (req, res) => promotionController.updatePromotion(req, res));
router.delete('/promotions/:id', (req, res) => promotionController.deletePromotion(req, res));

// 8. Reviews
router.get('/reviews', (req, res) => reviewController.getReviews(req, res));
router.post('/reviews/:id/reply', (req, res) => reviewController.replyReview(req, res));

export default router;