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

const apiRouter = Router();

// Health Check
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'UniEat Express Campus API',
    technologies: [
      'React.js (.tsx)',
      'TypeScript',
      'Tailwind CSS',
      'Node.js',
      'Express.js',
      'MySQL Schema (database.sql)',
      'JWT & Bcrypt',
      'Cloudinary CDN',
      'QR Code Dining Table',
      'Socket.IO Realtime',
      'Online Payment (VNPay & MoMo)',
    ],
    architecture: 'Router -> Middlewares -> Validations -> Controllers -> Services -> Models',
    timestamp: new Date().toISOString(),
  });
});

// Authentication (JWT + Bcrypt)
apiRouter.use('/auth', authRoutes);

// Image Upload (Cloudinary)
apiRouter.use('/upload', uploadRoutes);

// Group 1: Nhóm Người dùng & Hồ sơ cá nhân
apiRouter.use('/users', userRoutes);

// Group 2: Nhóm Vận hành & Cơ sở vật chất (Bàn ăn & Căng tin)
apiRouter.use('/tables', tableRoutes);
apiRouter.use('/canteens', canteenRoutes);

// Group 3: Nhóm Thực đơn (Menu) & Tìm kiếm (Search)
apiRouter.use('/menu', menuRoutes);

/**
 * /api/search
 * Search endpoint with server-side pagination, canteens, and dynamic search history
 */
apiRouter.use('/search', searchRoutes);
// Direct aliases for convenience:
apiRouter.get('/categories', (req, res, next) => {
  req.url = '/categories';
  menuRoutes(req, res, next);
});
apiRouter.get('/products', (req, res, next) => {
  req.url = '/products';
  menuRoutes(req, res, next);
});
apiRouter.get('/products/:id', (req, res, next) => {
  req.url = `/products/${req.params.id}`;
  menuRoutes(req, res, next);
});

// Group 4: Nhóm Giỏ hàng (Mua sắm)
apiRouter.use('/cart', cartRoutes);

// Group 5: Nhóm Giao dịch & Đơn hàng
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payments', paymentRoutes);

// Group 6: Nhóm Marketing (Quản trị bởi Admin)
apiRouter.use('/marketing', marketingRoutes);
// Direct aliases for vouchers and banners:
apiRouter.use('/vouchers', (req, res, next) => {
  if (req.path === '/validate' && req.method === 'POST') {
    req.url = '/vouchers/validate';
  } else if (req.path === '/' && req.method === 'GET') {
    req.url = '/vouchers';
  }
  marketingRoutes(req, res, next);
});
apiRouter.use('/banners', (req, res, next) => {
  req.url = '/banners';
  marketingRoutes(req, res, next);
});
apiRouter.use('/flash-sales', (req, res, next) => {
  req.url = `/flash-sales${req.url === '/' ? '' : req.url}`;
  marketingRoutes(req, res, next);
});

// Group 7: Nhóm Tương tác & Trải nghiệm khách hàng
apiRouter.use('/interactions', interactionRoutes);
apiRouter.use('/reviews', (req, res, next) => {
  req.url = `/reviews${req.url === '/' ? '' : req.url}`;
  interactionRoutes(req, res, next);
});
apiRouter.use('/notifications', (req, res, next) => {
  req.url = `/notifications${req.url === '/' ? '' : req.url}`;
  interactionRoutes(req, res, next);
});

// Group 8: Staff Canteen Management & Operations
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/pickup-slots', (req, res, next) => {
  req.url = `/pickup-slots${req.url === '/' ? '' : req.url}`;
  staffRoutes(req, res, next);
});

export default apiRouter;
