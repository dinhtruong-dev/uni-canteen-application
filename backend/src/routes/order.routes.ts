import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateCreateOrder, validateUpdateOrderStatus } from '../validations/order.validation';

const router = Router();

// KDS Kitchen Display System Routes (High-speed Kitchen Terminal)
router.get('/kds/live', (req, res) => orderController.getKDSOrders(req as any, res));
router.get('/kds/history', (req, res) => orderController.getKDSHistory(req as any, res));
router.post('/kds/:id/call-customer', (req, res) => orderController.callCustomer(req as any, res));
router.patch('/kds/:id/status', (req, res) => orderController.updateKDSStatus(req as any, res));

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
