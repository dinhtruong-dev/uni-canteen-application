import { Request, Response, NextFunction } from 'express';

export function validateDeliveryAddress(req: Request, res: Response, next: NextFunction) {
  const { recipientName, recipientPhone, dormBlock, roomNumber } = req.body;

  if (!recipientName || typeof recipientName !== 'string' || recipientName.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Tên người nhận không được để trống' });
  }

  if (!recipientPhone || !/^[0-9+]{9,13}$/.test(recipientPhone.trim())) {
    return res.status(400).json({ success: false, message: 'Số điện thoại người nhận không hợp lệ (9 - 13 chữ số)' });
  }

  if (!dormBlock || !roomNumber) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ Tòa KTX và Số phòng' });
  }

  next();
}

export function validateFavorite(req: Request, res: Response, next: NextFunction) {
  const { targetType, targetId } = req.body;
  if (!targetType || !['PRODUCT', 'ORDER'].includes(targetType)) {
    return res.status(400).json({ success: false, message: 'Loại mục yêu thích phải là PRODUCT hoặc ORDER' });
  }
  if (!targetId || typeof targetId !== 'string') {
    return res.status(400).json({ success: false, message: 'targetId không được để trống' });
  }
  next();
}
