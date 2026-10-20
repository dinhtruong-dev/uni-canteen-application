import { Router } from 'express';
import { userManagementController } from '../../controllers/admin/userManagement.controller';

const router = Router();

router.get('/', (req, res) => userManagementController.getUsers(req, res));
router.patch('/:id/role', (req, res) => userManagementController.updateUserRole(req, res));
router.patch('/:id/status', (req, res) => userManagementController.toggleUserStatus(req, res));
router.post('/staff', (req, res) => userManagementController.createStaffUser(req, res));

export default router;
