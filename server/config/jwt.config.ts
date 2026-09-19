/**
 * ==============================================================================
 * CẤU HÌNH XÁC THỰC JWT (JSON WEB TOKEN CONFIG)
 * ==============================================================================
 * [HƯỚNG DẪN CẤU HÌNH TRÊN MÁY CỦA BẠN]:
 * Bạn có thể đổi JWT_SECRET trong backend/.env thành bất kỳ chuỗi bảo mật ngẫu nhiên nào.
 */

import dotenv from 'dotenv';
dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'unieat_campus_super_secret_jwt_key_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  saltRounds: 10, // Độ phức tạp của mã hóa Bcrypt
};
