import { Router } from 'express';
import { adminDashboardController } from '../../controllers/admin/dashboard.controller';

const router = Router();

router.get('/overview', (req, res) => adminDashboardController.getOverview(req, res));
router.get('/statistics', (req, res) => adminDashboardController.getStatistics(req, res));

export default router;
