import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { UserRole } from '../types/auth.types';
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
    record.blockedUntil = now + 5 * 60 * 1000;
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
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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

  req.user = {
    id: decoded.id,
    name: decoded.name,
    email: decoded.email,
    role: decoded.role,
  };

  return next();
}

// ==============================================================================
// AUTH MIDDLEWARE CHO CÁC ROUTE CÔNG KHAI CÓ TÙY CHỌN USER
// ==============================================================================
export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    if (decoded) {
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };
      return next();
    }
  }

  const customUserId = (req.headers['x-user-id'] as string) || 'user-stu-1';
  if (customUserId === 'user-staff-1') {
    req.user = {
      id: 'user-staff-1',
      name: 'Nguyễn Văn An (Trưởng Quầy Căn Tin A2)',
      email: 'staff.a@canteen.edu.vn',
      role: 'STAFF' as UserRole,
    };
  } else if (customUserId === 'user-admin-1') {
    req.user = {
      id: 'user-admin-1',
      name: 'Quản Trị Viên Hệ Thống',
      email: 'admin@university.edu.vn',
      role: 'ADMIN' as UserRole,
    };
  } else {
    req.user = {
      id: customUserId,
      name: customUserId === 'user-stu-1' ? 'Đặng Hoàng Minh' : 'Sinh viên',
      email: customUserId === 'user-stu-1' ? 'minh.dh22@university.edu.vn' : '',
      role: 'STUDENT' as UserRole,
      studentId: customUserId === 'user-stu-1' ? '20230012' : undefined,
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
