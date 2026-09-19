/**
 * ==============================================================================
 * CẤU HÌNH KẾT NỐI REDIS CACHE & PUBSUB (REDIS CONFIGURATION)
 * ==============================================================================
 * [HƯỚNG DẪN CẤU HÌNH TRÊN MÁY CỦA BẠN - LOCAL MACHINE CONFIG]:
 * 
 * 1. REDIS LÀ GÌ VÀ KHI NÀO DÙNG?
 *    - Cache dữ liệu: Lưu tạm danh mục món ăn (menu), món bán chạy (bestseller)
 *      giúp giảm tải truy vấn MySQL và tăng tốc phản hồi API lên dưới 5ms.
 *    - Session / Token Blacklist: Lưu JWT token bị thu hồi khi đăng xuất hoặc OTP.
 *    - Rate Limiting: Chống spam request đặt đơn hàng hoặc quét mã liên tục.
 *    - Pub/Sub: Đồng bộ thông báo Real-Time khi mở rộng nhiều máy chủ socket.
 * 
 * 2. CÁCH CÀI ĐẶT REDIS TRÊN MÁY LOCAL:
 *    - Cách 1 (Docker - Khuyên dùng):
 *        docker run -d --name redis-unieat -p 6379:6379 redis:alpine
 *    - Cách 2 (Windows):
 *        Tải tệp cài đặt Redis cho Windows (hoặc Memurai) và chạy cổng 6379.
 *    - Cách 3 (Linux / WSL / Mac):
 *        sudo apt install redis-server && sudo service redis-server start
 * 
 * 3. THÔNG SỐ TRONG FILE '.env':
 *    - REDIS_ENABLED=false (Mặc định để 'false' nếu chưa cài Redis, đổi thành 'true' khi muốn dùng)
 *    - REDIS_HOST=localhost (hoặc 127.0.0.1)
 *    - REDIS_PORT=6379
 *    - REDIS_PASSWORD= (để trống nếu không đặt mật khẩu)
 * ==============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

export const redisConfig = {
  // Bật/tắt sử dụng Redis (tiện lợi: nếu chưa cài đặt Redis thì hệ thống tự động fallback an toàn)
  enabled: process.env.REDIS_ENABLED === 'true',

  // Địa chỉ máy chủ Redis
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),

  // Thời gian chờ kết nối (ms)
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),

  // Cấu hình thời gian sống của Cache (Time-to-live tính bằng giây)
  ttl: {
    DEFAULT: 3600,             // 1 giờ
    MENU_CATEGORIES: 1800,     // 30 phút cho danh mục món ăn
    BESTSELLERS: 600,          // 10 phút cho danh sách món bán chạy
    FLASH_SALE: 300,           // 5 phút cho flash sale
    DINING_TABLES: 60,         // 1 phút cho trạng thái bàn ăn
    USER_SESSION: 86400 * 7,   // 7 ngày cho phiên đăng nhập
  },

  // Tiền tố khóa cache (Key Prefixes) để tránh trùng lặp
  prefixes: {
    CACHE: 'unieat:cache:',
    SESSION: 'unieat:session:',
    OTP: 'unieat:otp:',
    RATE_LIMIT: 'unieat:ratelimit:',
    LOCK: 'unieat:lock:',
  },
};
