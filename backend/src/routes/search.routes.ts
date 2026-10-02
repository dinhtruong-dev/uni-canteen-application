import { Router } from 'express';
import { searchController } from '../controllers/search.controller';

const router = Router();

// GET /api/search?q=query (execute search with server-side pagination)
router.get('/', (req, res) => searchController.search(req, res));

// GET /api/search/history (get search history from backend db)
router.get('/history', (req, res) => searchController.getHistory(req, res));

// POST /api/search/history (record search history keyword)
router.post('/history', (req, res) => searchController.addHistory(req, res));

// DELETE /api/search/history/:query (delete single search keyword)
router.delete('/history/:query', (req, res) => searchController.removeHistory(req, res));

// DELETE /api/search/history (clear all search history)
router.delete('/history', (req, res) => searchController.clearHistory(req, res));

export default router;
