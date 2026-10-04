import { Router } from 'express';
import { canteenController } from '../controllers/canteen.controller';

const router = Router();

router.get('/', (req, res) => canteenController.getAllCanteens(req, res));
router.post('/', (req, res) => canteenController.createCanteen(req, res));
router.get('/:id', (req, res) => canteenController.getCanteenById(req, res));
router.put('/:id', (req, res) => canteenController.updateCanteen(req, res));
router.delete('/:id', (req, res) => canteenController.deleteCanteen(req, res));
router.patch('/:id/toggle-status', (req, res) => canteenController.toggleStatus(req, res));

export default router;
