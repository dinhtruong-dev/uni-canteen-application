import { Request, Response, NextFunction } from 'express';

export function validateUpdateCanteen(req: Request, res: Response, next: NextFunction) {
  const { displayName, name } = req.body;
  if (displayName === '' || name === '') {
    return res.status(400).json({
      success: false,
      message: 'Tên căng tin không được để trống',
    });
  }
  next();
}
