import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';
import tableRoutes from './table.routes';
import menuRoutes from './menu.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import marketingRoutes from './marketing.routes';
import interactionRoutes from './interaction.routes';
import canteenRoutes from './canteen.routes';
import searchRoutes from './search.routes';
import staffRoutes from './staff.routes';
import adminRoutes from './admin.routes';
import { sequelize } from '../db/sequelize';
import { User, Product, Category, Canteen, DiningTable, Voucher } from '../models';

const apiRouter = Router();

// Health Check & Database Status
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

// Trigger manual sync status check
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

// Authentication (JWT + Bcrypt)
apiRouter.use('/auth', authRoutes);

// Image Upload (Cloudinary)
apiRouter.use('/upload', uploadRoutes);

// Users & Profile
apiRouter.use('/users', userRoutes);

// Canteens
apiRouter.use('/canteens', canteenRoutes);

// Dining Tables & QR Codes
apiRouter.use('/tables', tableRoutes);

// Menu (Categories & Products)
apiRouter.use('/menu', menuRoutes);

// Cart (Shopping Cart)
apiRouter.use('/cart', cartRoutes);

// Orders
apiRouter.use('/orders', orderRoutes);

// Payment (VNPay & MoMo)
apiRouter.use('/payments', paymentRoutes);

// Marketing (Banners, Vouchers, Flash Sale)
apiRouter.use('/marketing', marketingRoutes);

// Interaction (Reviews & Notifications)
apiRouter.use('/interaction', interactionRoutes);

// Search & Filtering
apiRouter.use('/search', searchRoutes);

// Staff Portal (Pos, Kitchen, Orders, Tables)
apiRouter.use('/staff', staffRoutes);

// Admin Portal (Analytics, Users, System Management)
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
