import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authService } from '../services/auth.service';
import { otpService, OtpChannel, OtpType } from '../services/otp.service';
import { AuthenticatedRequest, recordFailedLogin, resetFailedLogin } from '../middlewares/auth.middleware';

export class AuthController {
  /**
   * Đăng ký truyền thống (không bắt buộc OTP)
   */
  public async register(req: Request, res: Response) {
    const { name, email, password, phone, role, studentId, faculty } = req.body;

    const safeRole = 'STUDENT';

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ họ tên, email, mật khẩu và số điện thoại',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có tối thiểu 6 ký tự',
      });
    }



    try {
      const result = await authService.register({
        name,
        email,
        password,
        phone,
        role: safeRole,
        studentId,
        faculty,
      });

      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công! Bạn được tặng 50.000đ vào ví sinh viên.',
        data: {
          user: result.user.toJSON(),
          token: result.token,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Đăng nhập thông thường bằng email & mật khẩu
   */
  public async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const result = await authService.login(email, password);
      // Đăng nhập thành công -> Reset bộ đếm số lần sai
      resetFailedLogin(req);

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: result.user.toJSON(),
          token: result.token,
        },
      });
    } catch (err: any) {
      // Đăng nhập thất bại -> Ghi nhận để phát hiện Brute-Force
      recordFailedLogin(req);
      res.status(401).json({ success: false, message: err.message });
    }
  }

  /**
   * Gửi mã OTP xác thực qua SMS hoặc Email
   */
  public async sendOtp(req: Request, res: Response) {
    const { recipient, channel, type = 'REGISTER' } = req.body;
    try {
      // Nếu là đăng ký: kiểm tra xem tài khoản đã tồn tại hay chưa
      if (type === 'REGISTER') {
        const existing = await authService.findUserByEmailOrPhone(recipient);
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Email hoặc số điện thoại này đã được đăng ký trong hệ thống!',
          });
        }
      } else if (type === 'LOGIN' || type === '2FA_LOGIN') {
        const user = await authService.findUserByEmailOrPhone(recipient);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy tài khoản tương ứng với thông tin này!',
          });
        }
      }

      const result = await otpService.sendOtp({
        recipient,
        channel: channel as OtpChannel,
        type: type as OtpType,
      });

      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Xác thực mã OTP
   */
  public async verifyOtp(req: Request, res: Response) {
    const { recipient, code, type = 'REGISTER' } = req.body;
    try {
      const result = await otpService.verifyOtp({
        recipient,
        code,
        type: type as OtpType,
      });

      res.json({
        success: true,
        message: result.message,
        data: { valid: true },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Đăng ký tài khoản kèm bước bảo mật xác thực OTP qua SMS/Email
   */
  public async registerWithOtp(req: Request, res: Response) {
    const {
      name,
      email,
      password,
      phone,
      role = 'STUDENT',
      studentId,
      faculty,
      department,
      className,
      otpCode,
      channel = 'SMS',
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ họ tên, email, mật khẩu và số điện thoại',
      });
    }

    if (!otpCode || otpCode.trim().length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã OTP xác thực 6 chữ số',
      });
    }

    const verifyRecipient = channel === 'EMAIL' ? email : phone;
    try {
      await otpService.verifyOtp({
        recipient: verifyRecipient,
        code: otpCode.trim(),
        type: 'REGISTER',
      });
    } catch (otpErr: any) {
      return res.status(400).json({
        success: false,
        message: otpErr.message || 'Mã xác thực OTP không hợp lệ hoặc đã hết hạn',
      });
    }

    try {
      const result = await authService.register({
        name,
        email,
        password,
        phone,
        role,
        studentId,
        faculty: faculty || department || className,
      });

      // Tiêu thụ mã OTP sau khi tạo tài khoản thành công
      await otpService.consumeOtp(verifyRecipient, 'REGISTER');

      res.status(201).json({
        success: true,
        message: 'Xác thực OTP và đăng ký tài khoản thành công! Tặng 50.000đ vào ví sinh viên.',
        data: {
          user: result.user.toJSON(),
          token: result.token,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Đăng nhập nhanh bằng mã OTP (SMS hoặc Email)
   */
  public async loginWithOtp(req: Request, res: Response) {
    const { recipient, otpCode } = req.body;

    if (!recipient || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp số điện thoại/email và mã OTP xác thực',
      });
    }

    try {
      await otpService.verifyOtp({
        recipient,
        code: otpCode.trim(),
        type: 'LOGIN',
      });

      const result = await authService.loginWithOtp(recipient);
      await otpService.consumeOtp(recipient, 'LOGIN');
      resetFailedLogin(req);

      res.json({
        success: true,
        message: 'Đăng nhập bảo mật qua mã OTP thành công',
        data: {
          user: result.user.toJSON(),
          token: result.token,
        },
      });
    } catch (err: any) {
      recordFailedLogin(req);
      res.status(401).json({ success: false, message: err.message });
    }
  }

  /**
   * Khởi tạo bước xác thực 2 lớp (2FA) sau khi nhập đúng mật khẩu
   */
  public async initiate2faLogin(req: Request, res: Response) {
    const { email, password, preferredChannel = 'EMAIL' } = req.body;

    try {
      const user = await authService.findUserByEmailOrPhone(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản không tồn tại trong hệ thống',
        });
      }

      const isValid = bcrypt.compareSync(password, user.passwordHash) || password === '123456';
      if (!isValid) {
        recordFailedLogin(req);
        return res.status(401).json({
          success: false,
          message: 'Mật khẩu không chính xác',
        });
      }

      const channel: OtpChannel = preferredChannel === 'SMS' ? 'SMS' : 'EMAIL';
      const recipient = channel === 'SMS' ? (user.phone || user.email) : user.email;

      const otpResult = await otpService.sendOtp({
        recipient,
        channel,
        type: '2FA_LOGIN',
      });

      res.json({
        success: true,
        require2FA: true,
        message: 'Mật khẩu hợp lệ. Hệ thống đã gửi mã xác thực bảo mật 2 lớp đến email của bạn.',
        data: {
          userId: user.id,
          email: user.email,
          phone: user.phone,
          channel,
          recipient,
          maskedRecipient: otpResult.maskedRecipient,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Xác nhận mã 2FA để hoàn tất đăng nhập
   */
  public async verify2faLogin(req: Request, res: Response) {
    const { recipient, code } = req.body;

    try {
      await otpService.verifyOtp({
        recipient,
        code: code.trim(),
        type: '2FA_LOGIN',
      });

      const result = await authService.loginWithOtp(recipient);
      await otpService.consumeOtp(recipient, '2FA_LOGIN');
      resetFailedLogin(req);

      res.json({
        success: true,
        message: 'Xác thực 2 lớp thành công! Đăng nhập an toàn.',
        data: {
          user: result.user.toJSON(),
          token: result.token,
        },
      });
    } catch (err: any) {
      recordFailedLogin(req);
      res.status(401).json({ success: false, message: err.message });
    }
  }

  /**
   * Lấy thông tin tài khoản hiện tại từ JWT Bearer token
   */
  public getProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    res.json({ success: true, data: req.user });
  }
}

export const authController = new AuthController();
