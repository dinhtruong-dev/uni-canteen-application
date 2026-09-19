/**
 * ==============================================================================
 * CẤU HÌNH LƯU TRỮ HÌNH ẢNH CLOUDINARY CDN
 * ==============================================================================
 * [HƯỚNG DẪN CẤU HÌNH TRÊN MÁY CỦA BẠN]:
 * 1. Đăng ký tài khoản miễn phí tại: https://cloudinary.com
 * 2. Vào Dashboard -> lấy 3 thông số: Cloud Name, API Key, API Secret
 * 3. Điền vào file 'backend/.env' tương ứng:
 *    CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
 *    CLOUDINARY_API_KEY=key_so_cua_ban
 *    CLOUDINARY_API_SECRET=chuoi_secret_cua_ban
 * ==============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'unieat-campus',
  apiKey: process.env.CLOUDINARY_API_KEY || '123456789012345',
  apiSecret: process.env.CLOUDINARY_API_SECRET || 'local_cloudinary_secret',
  defaultFolder: 'unieat_food_items',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
};
