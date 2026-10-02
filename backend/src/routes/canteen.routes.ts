import { Router } from 'express';
import { canteenController } from '../controllers/canteen.controller';

const router = Router();

router.get('/', (req, res) => canteenController.getAllCanteens(req, res));
router.get('/:id', (req, res) => canteenController.getCanteenById(req, res));
router.patch('/:id/toggle-status', (req, res) => canteenController.toggleStatus(req, res));

export default router;
