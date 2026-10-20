import { Router } from 'express';
import { searchController } from '../../controllers/shared/search.controller';

const router = Router();

// GET /api/search?q=query
router.get('/', (req, res) => searchController.search(req, res));

// GET /api/search/history
router.get('/history', (req, res) => searchController.getHistory(req, res));

// POST /api/search/history
router.post('/history', (req, res) => searchController.addHistory(req, res));

// DELETE /api/search/history/:query
router.delete('/history/:query', (req, res) => searchController.removeHistory(req, res));

// DELETE /api/search/history
router.delete('/history', (req, res) => searchController.clearHistory(req, res));

export default router;
