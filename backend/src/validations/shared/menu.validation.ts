import { Request, Response, NextFunction } from 'express';

export function validateCreateCategory(req: Request, res: Response, next: NextFunction) {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Tên danh mục không được để trống' });
  }
  next();
}
