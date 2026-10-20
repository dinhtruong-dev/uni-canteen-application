import { Request, Response, NextFunction } from 'express';

export function validateUpdateUserRole(req: Request, res: Response, next: NextFunction) {
  const { role } = req.body;
  const validRoles = ['STUDENT', 'STAFF', 'ADMIN'];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Vai trò không hợp lệ. Cho phép: ${validRoles.join(', ')}`,
    });
  }

  next();
}

export function validateCreateStaffUser(req: Request, res: Response, next: NextFunction) {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ Tên, Email, Số điện thoại và Mật khẩu cho nhân viên mới',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu phải có tối thiểu 6 ký tự',
    });
  }

  next();
}
