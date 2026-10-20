import { Request, Response, NextFunction } from 'express';

export function validateCreateTable(req: Request, res: Response, next: NextFunction) {
  const { tableNumber } = req.body;
  if (!tableNumber || typeof tableNumber !== 'string' || !tableNumber.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Tên hoặc số bàn không được để trống (VD: Bàn 01)',
    });
  }
  next();
}

export function validateUpdateTable(req: Request, res: Response, next: NextFunction) {
  const { capacity } = req.body;
  if (capacity !== undefined && (typeof capacity !== 'number' || capacity < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Sức chứa của bàn phải là số nguyên >= 1',
    });
  }
  next();
}
