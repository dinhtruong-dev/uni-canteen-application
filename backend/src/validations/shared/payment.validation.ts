import { Request, Response, NextFunction } from 'express';

export function validateCreatePayment(req: Request, res: Response, next: NextFunction) {
  const { orderId, amount, method } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Thiếu mã đơn hàng (orderId)' });
  }

  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Số tiền thanh toán phải là số > 0' });
  }

  if (!method) {
    return res.status(400).json({ success: false, message: 'Thiếu phương thức thanh toán (method)' });
  }

  next();
}
