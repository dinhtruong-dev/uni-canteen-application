import express, { Express } from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import apiRouter from './routes/api';

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(requestLogger);

  app.get('/', (req, res) => {
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
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
        upload: '/api/upload',
      },
    });
  });

  app.use('/api', apiRouter);

  app.use(errorHandler);

  return app;
}