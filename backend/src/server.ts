/**
 * ==============================================================================
 * SERVER ENTRY POINT - UNIEAT CAMPUS BACKEND
 * ==============================================================================
 * Chạy server bằng lệnh:
 *   cd backend
 *   npm install
 *   npm run dev
 * ==============================================================================
 */

import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { socketManager } from './socket';
import { testDbConnection } from './config/db.config';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Khởi tạo Socket.IO Real-time Server từ module socket
  socketManager.init(httpServer);

  // Kiểm tra cấu hình kết nối DB
  await testDbConnection();

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 UniEat Campus Backend Server đang chạy!`);
    console.log(`📡 URL API: http://localhost:${PORT}/api`);
    console.log(`⚡ Socket.IO Real-time: http://localhost:${PORT}`);
    console.log(`🌐 Frontend Allowed: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`====================================================`);
  });
}

start().catch((err) => {
  console.error('Lỗi khởi động server:', err);
});
