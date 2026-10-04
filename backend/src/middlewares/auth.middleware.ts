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

// ==============================================================================
// LỚP 1: MIDDLEWARE BẢO MẬT CHỐNG BRUTE-FORCE ĐĂNG NHẬP (RATE LIMITER)
// ==============================================================================
interface RateLimitRecord {
  attempts: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

/**
 * Middleware giới hạn số lần đăng nhập sai (Brute-Force Protection)
 * Tối đa 5 lần thử sai trong 5 phút. Nếu vượt quá -> Khóa tạm thời 5 phút.
 */
export function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = (req.body?.email || '').toLowerCase().trim();
  const key = `${ip}_${email}`;

  const now = Date.now();
  const record = loginAttempts.get(key);

  if (record && record.blockedUntil && record.blockedUntil > now) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Tài khoản hoặc IP đã thử đăng nhập thất bại quá nhiều lần. Vui lòng thử lại sau ${remainingSeconds} giây.`,
    });
  }

  next();
}

export function recordFailedLogin(req: Request) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = (req.body?.email || '').toLowerCase().trim();
  const key = `${ip}_${email}`;

  const now = Date.now();
  const record = loginAttempts.get(key) || { attempts: 0 };
  record.attempts += 1;

  if (record.attempts >= 5) {
    record.blockedUntil = now + 5 * 60 * 1000; // Khóa 5 phút
    console.warn(`[Security Alert] Khóa tạm thời IP/Email: ${key} do thử đăng nhập sai ${record.attempts} lần.`);
  }

  loginAttempts.set(key, record);
}

export function resetFailedLogin(req: Request) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = (req.body?.email || '').toLowerCase().trim();
  const key = `${ip}_${email}`;
  loginAttempts.delete(key);
}

// ==============================================================================
// LỚP BẢO MẬT JWT BẮT BUỘC (STRICT JWT AUTHENTICATION MIDDLEWARE)
// ==============================================================================
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để tiếp tục (Thiếu JWT Bearer Token hợp lệ)',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = authService.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập đã hết hạn hoặc mã xác thực không hợp lệ. Vui lòng đăng nhập lại.',
    });
  }

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

// ==============================================================================
// AUTH MIDDLEWARE CHO CÁC ROUTE CÔNG KHAI CÓ TÙY CHỌN USER
// ==============================================================================
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
