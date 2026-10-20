import { Router } from 'express';
import { promotionController } from '../../controllers/shared/promotion.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateVoucherCheck } from '../../validations/shared/marketing.validation';

const router = Router();

router.get('/banners', (req, res) => promotionController.getBanners(req, res));
router.get('/flash-sales', (req, res) => promotionController.getFlashSales(req, res));
router.post('/flash-sales/:id/claim', authMiddleware, (req, res) =>
  promotionController.claimFlashSale(req, res)
);
router.get('/vouchers', (req, res) => promotionController.getVouchers(req, res));
router.post('/vouchers/validate', validateVoucherCheck, (req, res) =>
  promotionController.validateVoucher(req, res)
);
router.get('/user-vouchers', authMiddleware, (req, res) =>
  promotionController.getUserVouchers(req, res)
);
router.get('/my-vouchers', authMiddleware, (req, res) =>
  promotionController.getUserVouchers(req, res)
);
router.post('/user-vouchers/claim', authMiddleware, (req, res) =>
  promotionController.claimVoucher(req, res)
);
router.post('/my-vouchers/claim', authMiddleware, (req, res) =>
  promotionController.claimVoucher(req, res)
);

export default router;
