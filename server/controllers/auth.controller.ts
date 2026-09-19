import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class AuthController {
  public register(req: Request, res: Response) {
    const { name, email, password, phone, role, studentId, faculty } = req.body;

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
      const result = authService.register({
        name,
        email,
        password,
        phone,
        role,
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

  public login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ email và mật khẩu',
      });
    }

    try {
      const result = authService.login(email, password);
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: result.user.toJSON(),
          token: result.token,
        },
      });
    } catch (err: any) {
      res.status(401).json({ success: false, message: err.message });
    }
  }

  public getProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    res.json({ success: true, data: req.user });
  }
}

export const authController = new AuthController();
