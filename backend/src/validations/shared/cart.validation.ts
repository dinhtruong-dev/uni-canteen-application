import { Request, Response, NextFunction } from 'express';

export function validateAddToCart(req: Request, res: Response, next: NextFunction) {
  const { productId, quantity } = req.body;

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin món ăn (productId)' });
  }

  if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 1)) {
    return res.status(400).json({ success: false, message: 'Số lượng món phải là số nguyên dương >= 1' });
  }

  next();
}

export function validateUpdateCartItem(req: Request, res: Response, next: NextFunction) {
  const { quantity } = req.body;

  if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ success: false, message: 'Số lượng món phải là số không âm (>= 0)' });
  }

  next();
}
