import { Router, Request, Response } from 'express';
import { paymentController } from '../../controllers/shared/payment.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { paymentGatewayService } from '../../services/infrastructure/payment-gateway.service';
import { orderService } from '../../services/shared/order.service';

const router = Router();

// Student Wallet Endpoints
router.post('/process', authMiddleware, (req, res) =>
  paymentController.processPayment(req as any, res)
);
router.get('/wallet/transactions', authMiddleware, (req, res) =>
  paymentController.getWalletTransactions(req as any, res)
);
router.post('/wallet/topup', authMiddleware, (req, res) =>
  paymentController.topUpWallet(req as any, res)
);

// Online Payment Gateway: VNPay & MoMo URL/QR Generation
router.post('/create-gateway-url', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId, method } = req.body;

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const orderInfo = `Thanh toán đơn hàng ${order.orderCode} - Căng tin UniEat`;

    if (method === 'VNPAY') {
      const result = paymentGatewayService.createVNPayPayment(order.id, order.finalAmount, orderInfo);
      return res.json({ success: true, data: result });
    } else if (method === 'MOMO') {
      const result = paymentGatewayService.createMoMoPayment(order.id, order.finalAmount, orderInfo);
      return res.json({ success: true, data: result });
    } else {
      return res.status(400).json({ success: false, message: 'Cổng thanh toán không hợp lệ (hỗ trợ VNPAY, MOMO)' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tạo liên kết thanh toán', error: err.message });
  }
});

// Callback / Return simulation endpoints
router.get('/vnpay-return', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Thanh toán qua VNPay thành công!',
    query: req.query,
  });
});

export default router;
