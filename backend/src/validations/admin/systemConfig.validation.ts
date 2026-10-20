import { Request, Response, NextFunction } from 'express';

export function validateSystemConfig(req: Request, res: Response, next: NextFunction) {
  const { deliveryFee, serviceFee } = req.body;

  if (deliveryFee !== undefined && (typeof deliveryFee !== 'number' || deliveryFee < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Phí vận chuyển phải là số không âm (>= 0)',
    });
  }

  if (serviceFee !== undefined && (typeof serviceFee !== 'number' || serviceFee < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Phí dịch vụ phải là số không âm (>= 0)',
    });
  }

  next();
}
