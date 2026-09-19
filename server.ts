import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './backend/src/routes/api';
import { requestLogger } from './backend/src/middlewares/logger.middleware';
import { errorHandler } from './backend/src/middlewares/errorHandler.middleware';
import { socketManager } from './backend/src/socket';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = http.createServer(app);

  // Initialize Socket.IO Real-time Engine from socket module
  socketManager.init(httpServer);

  // Middlewares
  app.use(express.json());
  app.use(requestLogger);

  // Mount API routes FIRST
  app.use('/api', apiRouter);

  // Error Handling Middleware for API
  app.use(errorHandler);

  // Vite middleware for development / Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`UniEat Campus Full-Stack Server running on port ${PORT} (Socket.IO + REST)`);
  });
}

startServer();
