import { Request, Response, NextFunction } from 'express';

export function validateCreateFood(req: Request, res: Response, next: NextFunction) {
  const { name, price, categoryId } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Tên món ăn không được để trống',
    });
  }

  if (price === undefined || typeof price !== 'number' || price < 0) {
    return res.status(400).json({
      success: false,
      message: 'Giá món ăn phải là số không âm (>= 0)',
    });
  }

  if (!categoryId) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng chọn danh mục cho món ăn',
    });
  }

  next();
}

export function validateUpdateFood(req: Request, res: Response, next: NextFunction) {
  const { price } = req.body;

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Giá món ăn phải là số không âm (>= 0)',
    });
  }

  next();
}
