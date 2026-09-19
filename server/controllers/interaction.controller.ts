import { Request, Response } from 'express';
import { interactionService } from '../services/interaction.service';
import { realtimeService } from '../services/realtime.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class InteractionController {
  // Reviews
  public getReviews(req: Request, res: Response) {
    const { targetType, targetId } = req.query;
    const reviews = interactionService
      .getReviews(targetType as any, targetId as string)
      .map((r) => r.toJSON());
    res.json({ success: true, total: reviews.length, data: reviews });
  }

  public createReview(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const userName = req.user?.name || 'Sinh viên';
    const review = interactionService.createReview({
      ...req.body,
      userId,
      userName,
    });
    res.status(201).json({ success: true, message: 'Cảm ơn bạn đã gửi đánh giá!', data: review.toJSON() });
  }

  // Notifications
  public getNotifications(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const notifications = interactionService.getNotifications(userId).map((n) => n.toJSON());
    res.json({ success: true, total: notifications.length, data: notifications });
  }

  public markAsRead(req: AuthenticatedRequest, res: Response) {
    const ok = interactionService.markAsRead(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }
    res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
  }

  public pushNotification(req: AuthenticatedRequest, res: Response) {
    const notif = interactionService.createNotification(req.body);
    res.status(201).json({ success: true, message: 'Đã gửi thông báo thành công', data: notif.toJSON() });
  }

  // Real-time Event Stream (SSE)
  public streamEvents(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || (req.query.userId as string) || 'user-stu-1';

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Register with realtime service
    realtimeService.registerClient(userId, res);

    // Initial greeting ping
    res.write(`event: connected\ndata: ${JSON.stringify({ userId, connectedAt: new Date() })}\n\n`);

    // Keep connection alive every 30s
    const keepAlive = setInterval(() => {
      res.write(': ping\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
    });
  }
}

export const interactionController = new InteractionController();
