import { Router } from 'express';
import { marketingController } from '../controllers/marketing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateVoucherCheck } from '../validations/marketing.validation';

const router = Router();

router.get('/banners', (req, res) => marketingController.getBanners(req, res));
router.get('/flash-sales', (req, res) => marketingController.getFlashSales(req, res));
router.post('/flash-sales/:id/claim', authMiddleware, (req, res) =>
  marketingController.claimFlashSale(req, res)
);
router.get('/vouchers', (req, res) => marketingController.getVouchers(req, res));
router.post('/vouchers/validate', validateVoucherCheck, (req, res) =>
  marketingController.validateVoucher(req, res)
);
router.get('/user-vouchers', authMiddleware, (req, res) =>
  marketingController.getUserVouchers(req, res)
);
router.get('/my-vouchers', authMiddleware, (req, res) =>
  marketingController.getUserVouchers(req, res)
);
router.post('/user-vouchers/claim', authMiddleware, (req, res) =>
  marketingController.claimVoucher(req, res)
);
router.post('/my-vouchers/claim', authMiddleware, (req, res) =>
  marketingController.claimVoucher(req, res)
);

export default router;
