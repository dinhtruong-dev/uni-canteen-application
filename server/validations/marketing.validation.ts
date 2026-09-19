import { Request, Response, NextFunction } from 'express';

export function validateVoucherCheck(req: Request, res: Response, next: NextFunction) {
  const { code, orderAmount } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mã Voucher' });
  }
  if (orderAmount !== undefined && (typeof orderAmount !== 'number' || orderAmount < 0)) {
    return res.status(400).json({ success: false, message: 'Giá trị đơn hàng không hợp lệ' });
  }
  next();
}
