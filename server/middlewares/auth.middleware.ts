import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models';
import { authService } from '../services/auth.service';
import { db } from '../services/database.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    studentId?: string;
    faculty?: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    if (decoded) {
      const userFromDb = db.users.get(decoded.id);
      req.user = {
        id: decoded.id,
        name: userFromDb?.name || decoded.name,
        email: decoded.email,
        role: decoded.role,
        studentId: userFromDb?.studentId,
        faculty: userFromDb?.faculty,
      };
      return next();
    }
  }

  // Fallback to active demo student user if no token provided
  const customUserId = req.headers['x-user-id'] as string;
  const user = db.users.get(customUserId || 'user-stu-1');

  if (user) {
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      faculty: user.faculty,
    };
  } else {
    req.user = {
      id: 'user-stu-1',
      name: 'Đặng Hoàng Minh',
      email: 'minh.dh22@university.edu.vn',
      role: 'STUDENT',
      studentId: 'SV20220192',
    };
  }

  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này',
      });
    }
    next();
  };
}
