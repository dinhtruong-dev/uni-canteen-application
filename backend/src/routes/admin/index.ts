import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

import dashboardRoutes from './dashboard.routes';
import userManagementRoutes from './userManagement.routes';
import systemConfigRoutes from './systemConfig.routes';
import {
  adminDashboardController,
  systemConfigController,
  adminCanteenController,
  adminReportController,
} from '../../controllers';

const adminRouter = Router();

// Bắt buộc quyền ADMIN
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware('ADMIN'));

// Sub-routes
adminRouter.use('/dashboard', dashboardRoutes);
adminRouter.use('/users', userManagementRoutes);
adminRouter.use('/config', systemConfigRoutes);

// Root endpoints for backward compatibility with frontend
adminRouter.use('/', dashboardRoutes);
adminRouter.post('/notifications', (req, res) => systemConfigController.pushNotification(req, res));

// Reviews moderation
adminRouter.get('/reviews', (req, res) => adminReportController.getReviews(req, res));
adminRouter.patch('/reviews/:id/visibility', (req, res) => adminReportController.toggleReviewVisibility(req, res));
adminRouter.post('/reviews/:id/reply', (req, res) => adminReportController.replyReview(req, res));

// Canteen management (Admin CRUD)
adminRouter.get('/canteens', (req, res) => adminCanteenController.getAllCanteens(req, res));
adminRouter.get('/canteens/:id', (req, res) => adminCanteenController.getCanteenById(req, res));
adminRouter.post('/canteens', (req, res) => adminCanteenController.createCanteen(req, res));
adminRouter.put('/canteens/:id', (req, res) => adminCanteenController.updateCanteen(req, res));
adminRouter.delete('/canteens/:id', (req, res) => adminCanteenController.deleteCanteen(req, res));
adminRouter.patch('/canteens/:id/toggle-status', (req, res) => adminCanteenController.toggleStatus(req, res));

export default adminRouter;
