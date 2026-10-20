import { Router } from 'express';
import { foodController } from '../../controllers/shared/food.controller';

const router = Router();

router.get('/', (req, res) => foodController.getFoods(req, res));
router.get('/:id', (req, res) => foodController.getFoodDetail(req, res));

export default router;
