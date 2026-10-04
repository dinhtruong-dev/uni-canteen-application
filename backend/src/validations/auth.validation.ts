import { Request, Response, NextFunction } from 'express';

// Email regex chuẩn RFC 5322 cơ bản
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Số điện thoại Việt Nam (9 - 13 ký tự số)
const PHONE_REGEX = /^[0-9+]{9,13}$/;

/**
 * ==============================================================================
 * VALIDATION ĐĂNG NHẬP (LOGIN VALIDATION LAYER)
 * ==============================================================================
 * Kiểm tra tính hợp lệ của dữ liệu đầu vào trước khi chuyển đến Controller/Database:
 * - Email: Không được rỗng, phải đúng cấu trúc email
 * - Mật khẩu: Không được rỗng, độ dài tối thiểu 6 ký tự
 */
export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập địa chỉ email của bạn',
      field: 'email',
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Định dạng email không hợp lệ (Ví dụ: sinhvien@university.edu.vn)',
      field: 'email',
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập mật khẩu tài khoản',
      field: 'password',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên',
      field: 'password',
    });
  }

  // Chuẩn hóa email trước khi vào Controller
  req.body.email = cleanEmail;
  next();
}

/**
 * ==============================================================================
 * VALIDATION ĐĂNG KÝ (REGISTER VALIDATION LAYER)
 * ==============================================================================
 * Kiểm tra toàn diện thông tin đăng ký tài khoản sinh viên/nhân viên:
 * - Họ tên: Tối thiểu 2 ký tự, không vượt quá 100 ký tự
 * - Email: Đúng cú pháp chuẩn
 * - Mật khẩu: Tối thiểu 6 ký tự
 * - Số điện thoại: 9 - 13 chữ số
 * - Phân quyền (Role): Chỉ chấp nhận STUDENT, STAFF, ADMIN
 */
export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { name, email, password, phone, role } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Họ và tên không được để trống và phải có ít nhất 2 ký tự',
      field: 'name',
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Họ và tên không được vượt quá 100 ký tự',
      field: 'name',
    });
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp địa chỉ email',
      field: 'email',
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Định dạng email đăng ký không hợp lệ',
      field: 'email',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu khởi tạo phải có tối thiểu 6 ký tự',
      field: 'password',
    });
  }

  if (!phone || typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Số điện thoại không hợp lệ (Phải từ 9 đến 13 chữ số)',
      field: 'phone',
    });
  }

  if (role && !['STUDENT', 'STAFF', 'ADMIN'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Vai trò tài khoản không hợp lệ (Chỉ chấp nhận: STUDENT, STAFF, ADMIN)',
      field: 'role',
    });
  }

  // Chuẩn hóa dữ liệu
  req.body.name = name.trim();
  req.body.email = cleanEmail;
  req.body.phone = phone.trim();

  next();
}
