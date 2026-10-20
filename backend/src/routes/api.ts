import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';

import adminRoutes from './admin';
import staffRoutes from './staff';
import sharedRoutes, {
  canteenRoutes,
  tableRoutes,
  menuRoutes,
  cartRoutes,
  orderRoutes,
  paymentRoutes,
  marketingRoutes,
  interactionRoutes,
  searchRoutes,
  foodRoutes,
} from './shared';

import { sequelize } from '../db/sequelize';
import { User, Product, Category, Canteen, DiningTable, Voucher } from '../models';

const apiRouter = Router();

apiRouter.get('/health', async (_req, res) => {
  let connected = false;
  let stats = {
    categories: 0,
    products: 0,
    users: 0,
    canteens: 0,
    tables: 0,
    vouchers: 0,
  };

  try {
    await sequelize.authenticate();
    connected = true;
    const [uCount, pCount, cCount, cantCount, tCount, vCount] = await Promise.all([
      User.count(),
      Product.count(),
      Category.count(),
      Canteen.count(),
      DiningTable.count(),
      Voucher.count(),
    ]);

    stats = {
      categories: cCount,
      products: pCount,
      users: uCount,
      canteens: cantCount,
      tables: tCount,
      vouchers: vCount,
    };
  } catch { }

  res.json({
    status: 'ok',
    service: 'UniEat Express Campus API',
    database: {
      connected,
      syncedWithMySQL: connected,
      dataSource: connected
        ? 'MySQL Live Database (Sequelize ORM)'
        : 'Database Disconnected',
      stats,
    },
    technologies: [
      'React.js (.tsx)',
      'TypeScript',
      'Tailwind CSS',
      'Node.js',
      'Express.js',
      'Sequelize ORM',
      'JWT & Bcrypt',
      'Cloudinary CDN',
      'QR Code Dining Table',
      'Socket.IO Realtime',
      'Online Payment (VNPay & MoMo)',
    ],
    architecture: 'Stateless Back-End (Sequelize ORM Engine)',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.post('/health/sync-db', async (_req, res) => {
  let connected = false;
  try {
    await sequelize.authenticate();
    connected = true;
  } catch { }

  res.json({
    success: connected,
    message: connected
      ? '✅ Đã kết nối và vận hành trực tiếp trên MySQL Database via Sequelize!'
      : '❌ Không thể kết nối MySQL. Hãy đảm bảo MySQL đang chạy và đúng cấu hình.',
    syncedWithMySQL: connected,
  });
});

// Root common routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/users', userRoutes);

// Admin & Staff Role Routes
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/staff', staffRoutes);

// Shared / Customer Routes (mount trực tiếp để tương thích hoàn toàn URL frontend)
apiRouter.use('/canteens', canteenRoutes);
apiRouter.use('/tables', tableRoutes);
apiRouter.use('/menu', menuRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/marketing', marketingRoutes);
apiRouter.use('/interaction', interactionRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/foods', foodRoutes);

// Shared router prefix /shared/...
apiRouter.use('/shared', sharedRoutes);

export default apiRouter;
