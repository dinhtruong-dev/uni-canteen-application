import { Request, Response, NextFunction } from 'express';

export function validateVoucher(req: Request, res: Response, next: NextFunction) {
  const { code, discountValue } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, message: 'Mã voucher không được để trống' });
  }

  if (discountValue === undefined || typeof discountValue !== 'number' || discountValue <= 0) {
    return res.status(400).json({ success: false, message: 'Giá trị giảm phải là số > 0' });
  }

  next();
}

export const validateVoucherCheck = validateVoucher;

