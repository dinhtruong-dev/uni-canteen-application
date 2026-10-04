import express, { Express } from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import apiRouter from './routes/api';

export function createApp(): Express {
  const app = express();

  // 1. CORS Configuration (Cho phép Frontend Local kết nối)
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    })
  );

  // 2. Body Parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. Request Logging
  app.use(requestLogger);

  // 4. Root & API Routes
  app.get('/', (req, res) => {
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    // Nếu mở từ trình duyệt web, tự động chuyển hướng sang Frontend
    if (req.accepts('html')) {
      return res.redirect(frontendUrl);
    }
    return res.json({
      status: 'ok',
      service: 'UniEat Express Campus API',
      frontendUrl,
      apiHealth: '/api/health',
    });
  });

  app.get('/api', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'UniEat Campus Backend API',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        menu: '/api/menu',
        orders: '/api/orders',
        tables: '/api/tables',
        canteens: '/api/canteens',
      },
    });
  });

  app.use('/api', apiRouter);

  // 5. Global Error Handling Middleware
  app.use(errorHandler);

  return app;
}
