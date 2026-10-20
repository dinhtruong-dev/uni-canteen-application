import { Router } from 'express';
import { staffOrderController } from '../../controllers/staff/staffOrder.controller';

const router = Router();

router.get('/', (req, res) => staffOrderController.getOrders(req, res));
router.patch('/:id/status', (req, res) => staffOrderController.updateOrderStatus(req, res));
router.post('/verify-pickup', (req, res) => staffOrderController.verifyPickup(req, res));

export default router;
