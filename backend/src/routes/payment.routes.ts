import { Router, Request, Response } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { paymentGatewayService } from '../services/payment-gateway.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { db } from '../services/database.service';

const router = Router();

// Order Payment Details
router.get('/orders/:orderId', authMiddleware, (req, res) =>
  paymentController.getPaymentByOrder(req as any, res)
);

// Campus Wallet Top-up & Transactions
router.get('/wallet/transactions', authMiddleware, (req, res) =>
  paymentController.getWalletTransactions(req as any, res)
);
router.post('/wallet/topup', authMiddleware, (req, res) =>
  paymentController.topUpWallet(req as any, res)
);

// Online Payment Gateway: VNPay & MoMo URL/QR Generation
router.post('/create-gateway-url', authMiddleware, (req: Request, res: Response) => {
  const { orderId, method } = req.body;

  const order = db.orders.get(orderId);
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
});

// Callback / Webhook Simulation for VNPay / MoMo
router.post('/confirm-gateway-payment', authMiddleware, (req: Request, res: Response) => {
  const { orderId, transactionCode, provider } = req.body;
  const ok = paymentGatewayService.confirmGatewayPayment(orderId, transactionCode, provider);
  if (!ok) {
    return res.status(400).json({ success: false, message: 'Xác nhận thanh toán thất bại' });
  }
  res.json({
    success: true,
    message: `Thanh toán qua cổng ${provider} thành công! Đơn hàng đã được xác nhận.`,
  });
});

export default router;
