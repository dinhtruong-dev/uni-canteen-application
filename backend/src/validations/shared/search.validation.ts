import { Request, Response, NextFunction } from 'express';

export function validateSearch(req: Request, res: Response, next: NextFunction) {
  const { q } = req.query;
  if (q !== undefined && typeof q !== 'string') {
    return res.status(400).json({ success: false, message: 'Từ khóa tìm kiếm không hợp lệ' });
  }
  next();
}
