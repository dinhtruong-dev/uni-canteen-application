import { Router } from 'express';
import { shiftController } from '../../controllers/staff/shift.controller';

const router = Router();

router.post('/check-in', (req, res) => shiftController.checkIn(req, res));
router.post('/check-out', (req, res) => shiftController.checkOut(req, res));
router.get('/my-shifts', (req, res) => shiftController.getMyShifts(req, res));

export default router;
