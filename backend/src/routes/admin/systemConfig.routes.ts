import { Router } from 'express';
import { systemConfigController } from '../../controllers/admin/systemConfig.controller';

const router = Router();

router.get('/', (req, res) => systemConfigController.getConfig(req, res));
router.put('/', (req, res) => systemConfigController.updateConfig(req, res));
router.post('/notifications', (req, res) => systemConfigController.pushNotification(req, res));

export default router;
