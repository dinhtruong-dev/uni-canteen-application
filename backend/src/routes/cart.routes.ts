import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateAddToCart, validateUpdateCartItem } from '../validations/cart.validation';

const router = Router();

router.get('/', authMiddleware, (req, res) => cartController.getCart(req as any, res));
router.post('/items', authMiddleware, validateAddToCart, (req, res) =>
  cartController.addItem(req as any, res)
);
router.patch('/items/:itemId', authMiddleware, validateUpdateCartItem, (req, res) =>
  cartController.updateItem(req as any, res)
);
router.delete('/items/:itemId', authMiddleware, (req, res) =>
  cartController.removeItem(req as any, res)
);
router.post('/sync', authMiddleware, (req, res) => cartController.syncCart(req as any, res));
router.delete('/', authMiddleware, (req, res) => cartController.clearCart(req as any, res));

export default router;
