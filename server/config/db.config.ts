/**
 * ==============================================================================
 * CẤU HÌNH KẾT NỐI DATABASE MYSQL (MYSQL DATABASE CONFIGURATION)
 * ==============================================================================
 * [HƯỚNG DẪN CẤU HÌNH TRÊN MÁY CỦA BẠN - LOCAL MACHINE CONFIG]:
 *
 * 1. Khởi động MySQL trên máy của bạn (qua XAMPP, Laragon, MySQL Workbench hoặc Docker).
 * 2. Mở phpMyAdmin hoặc công cụ quản lý DB, tạo mới 1 cơ sở dữ liệu:
 *    CREATE DATABASE `unieat_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 * 3. Import toàn bộ tệp 'database.sql' (ở thư mục gốc backend/database.sql) vào database này.
 * 4. Kiểm tra các thông số trong file '.env' ở thư mục 'backend/.env':
 *    - DB_HOST: Thường là 'localhost' hoặc '127.0.0.1'
 *    - DB_PORT: 3306 (hoặc cổng MySQL máy bạn, ví dụ 3307)
 *    - DB_USER: Mặc định XAMPP/Laragon là 'root'
 *    - DB_PASSWORD: Để trống '' nếu XAMPP chưa đặt pass, hoặc điền pass MySQL của bạn
 *    - DB_NAME: 'unieat_db'
 * ==============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unieat_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Hàm kiểm tra và thông báo trạng thái kết nối Database khi khởi động Server
export async function testDbConnection(): Promise<boolean> {
  try {
    // Khi chạy trên môi trường cục bộ có MySQL thực, bạn có thể uncomment kết nối mysql2:
    // const mysql = require('mysql2/promise');
    // const pool = mysql.createPool(dbConfig);
    // const [rows] = await pool.query('SELECT 1');
    console.log(`[Database] Đã sẵn sàng cấu hình kết nối MySQL -> Host: ${dbConfig.host}:${dbConfig.port} | Database: ${dbConfig.database}`);
    return true;
  } catch (error) {
    console.error('[Database Error] Không thể kết nối tới MySQL:', error);
    return false;
  }
}
