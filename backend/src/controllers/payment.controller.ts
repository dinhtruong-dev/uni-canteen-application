import { Response } from 'express';
import { paymentService } from '../services/payment.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class PaymentController {
  public getPaymentByOrder(req: AuthenticatedRequest, res: Response) {
    const payment = paymentService.getPaymentByOrderId(req.params.orderId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin giao dịch' });
    }
    res.json({ success: true, data: payment.toJSON() });
  }

  public topUpWallet(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const { amount, method } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Số tiền nạp không hợp lệ' });
    }

    try {
      const result = paymentService.topUpWallet(userId, Number(amount), method || 'MoMo');
      res.json({
        success: true,
        message: `Nạp thành công ${Number(amount).toLocaleString('vi-VN')}đ vào ví sinh viên`,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const paymentController = new PaymentController();
