import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { UserRole } from '../types/auth.types';

/**
 * Middleware kiểm tra quyền truy cập (Role Authorization)
 * @param allowedRoles Danh sách vai trò được phép truy cập (VD: 'STAFF', 'ADMIN')
 */
export function roleMiddleware(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập trước khi thực hiện thao tác này',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền truy cập chức năng này (Yêu cầu vai trò: ${allowedRoles.join(', ')})`,
      });
    }

    return next();
  };
}

export default roleMiddleware;
