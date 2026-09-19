import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Đã có lỗi hệ thống xảy ra trên máy chủ';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`,
  });
}
