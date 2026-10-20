import { Response } from 'express';
import { paymentService } from '../../services/shared/payment.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class PaymentController {
  public async processPayment(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const { orderId, amount, method } = req.body;
    if (!orderId || !amount || !method) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin thanh toán (orderId, amount, method)' });
    }
    try {
      const payment = await paymentService.processPayment(orderId, userId, Number(amount), method);
      const data = typeof (payment as any)?.toJSON === 'function' ? (payment as any).toJSON() : payment;
      return res.json({ success: true, message: 'Thanh toán thành công', data });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Lỗi xử lý thanh toán' });
    }
  }

  public async getPaymentByOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const payment = await paymentService.getPaymentByOrderId(req.params.orderId);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin giao dịch' });
      }
      const data = typeof (payment as any)?.toJSON === 'function' ? (payment as any).toJSON() : payment;
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi lấy thông tin thanh toán', error: err.message });
    }
  }

  public async getWalletTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const txs = await paymentService.getWalletTransactions(userId);
      return res.json({ success: true, total: txs.length, data: txs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử giao dịch ví', error: err.message });
    }
  }

  public async topUpWallet(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const { amount, method } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền nạp không hợp lệ' });
    }

    try {
      const result = await paymentService.topUpWallet(userId, Number(amount), method || 'MoMo');
      return res.json({
        success: true,
        message: `Nạp thành công ${Number(amount).toLocaleString('vi-VN')}đ vào ví sinh viên`,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const paymentController = new PaymentController();
