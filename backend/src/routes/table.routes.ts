import { Router } from 'express';
import { tableController } from '../controllers/table.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', (req, res) => tableController.getAllTables(req, res));
router.get('/qr', (req, res) => tableController.findByQr(req, res));
router.get('/:id', (req, res) => tableController.getTableById(req, res));
router.patch('/:id/status', authMiddleware, (req, res) => tableController.updateStatus(req, res));

export default router;
