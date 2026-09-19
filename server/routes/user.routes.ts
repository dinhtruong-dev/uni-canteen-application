import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateDeliveryAddress, validateFavorite } from '../validations/user.validation';

const router = Router();

// Profile
router.get('/me', authMiddleware, (req, res) => userController.getCurrentUser(req as any, res));

// Addresses
router.get('/addresses', authMiddleware, (req, res) => userController.getAddresses(req as any, res));
router.post('/addresses', authMiddleware, validateDeliveryAddress, (req, res) =>
  userController.createAddress(req as any, res)
);
router.delete('/addresses/:id', authMiddleware, (req, res) =>
  userController.deleteAddress(req as any, res)
);

// Favorites
router.get('/favorites', authMiddleware, (req, res) => userController.getFavorites(req as any, res));
router.post('/favorites/toggle', authMiddleware, validateFavorite, (req, res) =>
  userController.toggleFavorite(req as any, res)
);

export default router;
