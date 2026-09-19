import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';

const router = Router();

router.get('/categories', (req, res) => menuController.getCategories(req, res));
router.get('/products', (req, res) => menuController.getProducts(req, res));
router.get('/products/:id', (req, res) => menuController.getProductDetail(req, res));

export default router;
