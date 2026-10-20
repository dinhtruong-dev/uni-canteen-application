import { Router } from 'express';
import { pickupSlotController } from '../../controllers/staff/pickupSlot.controller';

const router = Router();

router.get('/', (req, res) => pickupSlotController.getPickupSlots(req, res));
router.post('/', (req, res) => pickupSlotController.createPickupSlot(req, res));
router.put('/:id', (req, res) => pickupSlotController.updatePickupSlot(req, res));
router.delete('/:id', (req, res) => pickupSlotController.deletePickupSlot(req, res));

export default router;
