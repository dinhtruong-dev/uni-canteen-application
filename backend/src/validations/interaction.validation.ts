import { Request, Response, NextFunction } from 'express';

export function validateReview(req: Request, res: Response, next: NextFunction) {
  const { targetType, targetId, rating, comment } = req.body;

  if (!targetType || !['PRODUCT', 'CANTEEN'].includes(targetType)) {
    return res.status(400).json({ success: false, message: 'Loại đánh giá phải là PRODUCT hoặc CANTEEN' });
  }

  if (!targetId || typeof targetId !== 'string') {
    return res.status(400).json({ success: false, message: 'Thiếu mã đối tượng đánh giá (targetId)' });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Điểm đánh giá phải từ 1 đến 5 sao' });
  }

  // Đã bỏ bắt buộc viết nhận xét theo yêu cầu: chỉ đánh giá sao không cần viết chữ
  if (comment !== undefined && typeof comment !== 'string') {
    return res.status(400).json({ success: false, message: 'Nội dung nhận xét không hợp lệ' });
  }

  next();
}

export function validateNotificationPush(req: Request, res: Response, next: NextFunction) {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung thông báo không được để trống' });
  }
  next();
}
