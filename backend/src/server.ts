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
import { db } from './services/database.service';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Khởi tạo Socket.IO Real-time Server từ module socket
  socketManager.init(httpServer);

  // Kiểm tra cấu hình kết nối DB và đồng bộ dữ liệu thực tế từ MySQL
  const isConnected = await testDbConnection();
  if (isConnected) {
    await db.syncFromMySQL();
  } else {
    console.warn('⚠️ [Gợi ý]: Hãy bật MySQL (XAMPP/MySQL Service) và kiểm tra file backend/.env để đồng bộ dữ liệu thật!');
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 UniEat Campus Backend Server đang chạy!`);
    console.log(`📱 Giao diện Web (Frontend): ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`📡 URL API Server: http://localhost:${PORT}/api`);
    console.log(`⚡ Socket.IO Real-time: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

start().catch((err) => {
  console.error('Lỗi khởi động server:', err);
});
