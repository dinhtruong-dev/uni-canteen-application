import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateCreateOrder, validateUpdateOrderStatus } from '../validations/order.validation';

const router = Router();

router.get('/', authMiddleware, (req, res) => orderController.getAllOrders(req as any, res));
router.get('/:id', authMiddleware, (req, res) => orderController.getOrderById(req as any, res));
router.post('/', authMiddleware, validateCreateOrder, (req, res) =>
  orderController.createOrder(req as any, res)
);
router.patch('/:id/status', authMiddleware, validateUpdateOrderStatus, (req, res) =>
  orderController.updateStatus(req as any, res)
);
router.post('/:id/cancel', authMiddleware, (req, res) =>
  orderController.cancelOrder(req as any, res)
);

export default router;
