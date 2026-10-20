import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { socketManager } from './socket';
import { connectDB } from './db/sequelize';
import { db } from './services/infrastructure/database.service';
import { redisWarmupService } from './services/infrastructure/redis-warmup.service';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  const app = createApp();
  const httpServer = http.createServer(app);

  socketManager.init(httpServer);

  try {
    await connectDB();
    await db.ensureUserRolesAndDefaultAccounts();
  } catch (error) {
    console.warn('[CẢNH BÁO]: Không thể kết nối MySQL. Hãy bật XAMPP/MySQL và kiểm tra file .env!');
  }

  try {
    await redisWarmupService.warmUpAll();
  } catch (redisError) {
    console.warn('[CẢNH BÁO]: Redis chưa bật hoặc lỗi kết nối. App vẫn chạy nhưng không có Cache!');
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`UniEat Campus Backend Server đang chạy!`);
    console.log(`Giao diện Web (Frontend): ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`URL API Server: http://localhost:${PORT}/api`);
    console.log(`Socket.IO Real-time: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

start().catch((err) => {
  console.error('Lỗi khởi động server (Fatal Error):', err);
});