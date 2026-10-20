import { Router } from 'express';
import { canteenController } from '../../controllers/shared/canteen.controller';

const router = Router();

router.get('/', (req, res) => canteenController.getAllCanteens(req, res));
router.get('/:id', (req, res) => canteenController.getCanteenById(req, res));

export default router;
