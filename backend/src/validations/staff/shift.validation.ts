import { Request, Response, NextFunction } from 'express';

export function validateCheckIn(req: Request, res: Response, next: NextFunction) {
  const { shiftType } = req.body;
  const validShifts = ['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'];

  if (shiftType && !validShifts.includes(shiftType)) {
    return res.status(400).json({
      success: false,
      message: `Ca làm việc không hợp lệ. Cho phép: ${validShifts.join(', ')}`,
    });
  }

  next();
}

export function validateCheckOut(req: Request, res: Response, next: NextFunction) {
  const { shiftId } = req.body;
  if (!shiftId) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mã ca trực (shiftId)',
    });
  }
  next();
}
