import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { loginRateLimiter, requireAuth } from '../middlewares/auth.middleware';
import { validateLogin, validateRegister, validateSendOtp, validateVerifyOtp } from '../validations';

const router = Router();

/**
 * ==============================================================================
 * ROUTE: ĐĂNG KÝ TÀI KHOẢN MỚI (/api/auth/register)
 * ==============================================================================
 */
router.post(
  '/register',
  validateRegister,
  (req, res) => authController.register(req, res)
);

/**
 * ==============================================================================
 * ROUTE: ĐĂNG KÝ BẢO MẬT KÈM XÁC THỰC MÃ OTP SMS / EMAIL (/api/auth/register-with-otp)
 * ==============================================================================
 */
router.post(
  '/register-with-otp',
  validateRegister,
  (req, res) => authController.registerWithOtp(req, res)
);

/**
 * ==============================================================================
 * ROUTE: ĐĂNG NHẬP HỆ THỐNG MẬT KHẨU (/api/auth/login)
 * ==============================================================================
 */
router.post(
  '/login',
  loginRateLimiter,
  validateLogin,
  (req, res) => authController.login(req, res)
);

/**
 * ==============================================================================
 * ROUTE: KHỞI TẠO BƯỚC BẢO MẬT 2 LỚP CHO ĐĂNG NHẬP (/api/auth/login-2fa-init)
 * ==============================================================================
 */
router.post(
  '/login-2fa-init',
  loginRateLimiter,
  validateLogin,
  (req, res) => authController.initiate2faLogin(req, res)
);

/**
 * ==============================================================================
 * ROUTE: XÁC THỰC MÃ 2FA ĐỂ HOÀN TẤT ĐĂNG NHẬP (/api/auth/login-2fa-verify)
 * ==============================================================================
 */
router.post(
  '/login-2fa-verify',
  loginRateLimiter,
  validateVerifyOtp,
  (req, res) => authController.verify2faLogin(req, res)
);

/**
 * ==============================================================================
 * ROUTE: ĐĂNG NHẬP NHANH BẰNG MÃ OTP SMS / EMAIL (/api/auth/login-with-otp)
 * ==============================================================================
 */
router.post(
  '/login-with-otp',
  loginRateLimiter,
  validateVerifyOtp,
  (req, res) => authController.loginWithOtp(req, res)
);

/**
 * ==============================================================================
 * ROUTE: GỬI MÃ OTP XÁC THỰC BẢO MẬT (/api/auth/otp/send)
 * ==============================================================================
 */
router.post(
  '/otp/send',
  validateSendOtp,
  (req, res) => authController.sendOtp(req, res)
);

/**
 * ==============================================================================
 * ROUTE: XÁC MINH MÃ OTP ĐỘC LẬP (/api/auth/otp/verify)
 * ==============================================================================
 */
router.post(
  '/otp/verify',
  validateVerifyOtp,
  (req, res) => authController.verifyOtp(req, res)
);

/**
 * ==============================================================================
 * ROUTE: THÔNG TIN TÀI KHOẢN HIỆN TẠI (/api/auth/me)
 * ==============================================================================
 */
router.get(
  '/me',
  requireAuth,
  (req, res) => authController.getProfile(req as any, res)
);

export default router;
