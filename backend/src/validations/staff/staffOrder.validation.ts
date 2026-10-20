import { Request, Response, NextFunction } from 'express';

export function validateStaffUpdateOrderStatus(req: Request, res: Response, next: NextFunction) {
  const { status } = req.body;
  const validStatuses = [
    'CONFIRMED',
    'PREPARING',
    'READY',
    'SERVED',
    'WAITING_PICKUP',
    'DELIVERING',
    'COMPLETED',
    'CANCELLED',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Trạng thái cập nhật không hợp lệ. Cho phép: ${validStatuses.join(', ')}`,
    });
  }

  next();
}

export function validateVerifyPickup(req: Request, res: Response, next: NextFunction) {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mã nhận món hoặc quét mã QR',
    });
  }
  next();
}
