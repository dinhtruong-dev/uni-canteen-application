import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { loginRateLimiter, requireAuth } from '../middlewares/auth.middleware';
import { validateLogin, validateRegister } from '../validations';

const router = Router();

/**
 * ==============================================================================
 * ROUTE: ĐĂNG KÝ TÀI KHOẢN MỚI (/api/auth/register)
 * ==============================================================================
 * Kiến trúc 2 lớp bảo mật:
 * - [Lớp 1 - Validation Layer]: validateRegister kiểm tra họ tên, email, sđt, mật khẩu hợp lệ
 * - [Lớp 2 - Controller & Service]: Mã hóa mật khẩu Bcrypt, lưu trữ MySQL, cấp JWT token
 */
router.post(
  '/register',
  validateRegister,
  (req, res) => authController.register(req, res)
);

/**
 * ==============================================================================
 * ROUTE: ĐĂNG NHẬP HỆ THỐNG (/api/auth/login)
 * ==============================================================================
 * Kiến trúc 2 lớp bảo mật:
 * - [Lớp 1 - Middleware Layer]: loginRateLimiter chống Brute-Force (tối đa 5 lần sai/5 phút)
 * - [Lớp 2 - Validation Layer]: validateLogin kiểm tra cấu trúc email RFC và độ dài mật khẩu >= 6
 * - [Lớp Controller & Service]: So khớp bcrypt, cấp phát JWT token có chữ ký số bí mật
 */
router.post(
  '/login',
  loginRateLimiter,
  validateLogin,
  (req, res) => authController.login(req, res)
);

/**
 * ==============================================================================
 * ROUTE: THÔNG TIN TÀI KHOẢN HIỆN TẠI (/api/auth/me)
 * ==============================================================================
 * - [Lớp Middleware JWT]: requireAuth bắt buộc kiểm tra JWT Bearer Token hợp lệ
 */
router.get(
  '/me',
  requireAuth,
  (req, res) => authController.getProfile(req as any, res)
);

export default router;
