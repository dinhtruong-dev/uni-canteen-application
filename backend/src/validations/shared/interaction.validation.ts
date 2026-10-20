import { Request, Response, NextFunction } from 'express';

export function validateCreateReview(req: Request, res: Response, next: NextFunction) {
  const { productId, rating } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin món ăn (productId)' });
  }

  if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Số sao đánh giá phải từ 1 đến 5 sao' });
  }

  next();
}

export function validateReplyReview(req: Request, res: Response, next: NextFunction) {
  const { replyText } = req.body;

  if (!replyText || !replyText.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung phản hồi không được để trống' });
  }

  next();
}

export const validateReview = validateCreateReview;

export function validateNotificationPush(req: Request, res: Response, next: NextFunction) {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung thông báo không được để trống' });
  }
  next();
}

