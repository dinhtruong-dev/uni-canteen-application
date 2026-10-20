import { Router } from 'express';
import { interactionController } from '../../controllers/shared/interaction.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateReview, validateNotificationPush } from '../../validations/shared/interaction.validation';

const router = Router();

// Reviews
router.get('/reviews', (req, res) => interactionController.getReviews(req, res));
router.post('/reviews', authMiddleware, validateReview, (req, res) =>
  interactionController.createReview(req as any, res)
);

// Notifications
router.get('/notifications', authMiddleware, (req, res) =>
  interactionController.getNotifications(req as any, res)
);
router.patch('/notifications/:id/read', authMiddleware, (req, res) =>
  interactionController.markAsRead(req as any, res)
);
router.post('/notifications', authMiddleware, validateNotificationPush, (req, res) =>
  interactionController.pushNotification(req as any, res)
);

// Realtime SSE stream
router.get('/stream', authMiddleware, (req, res) =>
  interactionController.streamEvents(req as any, res)
);

export default router;
