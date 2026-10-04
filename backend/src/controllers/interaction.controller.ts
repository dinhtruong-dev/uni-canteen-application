import { Request, Response } from 'express';
import { interactionService } from '../services/interaction.service';
import { realtimeService } from '../services/realtime.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class InteractionController {
  // Reviews
  public async getReviews(req: Request, res: Response) {
    try {
      const { targetType, targetId } = req.query;
      const reviews = await interactionService.getReviews(targetType as any, targetId as string);
      const data = reviews.map((r: any) => (typeof r?.toJSON === 'function' ? r.toJSON() : r));
      res.json({ success: true, total: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải đánh giá', error: err.message });
    }
  }

  public async createReview(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'user-stu-1';
    const userName = req.user?.name || 'Sinh viên';
    try {
      const review = await interactionService.createReview({
        ...req.body,
        userId,
        userName,
      });
      const data = typeof (review as any)?.toJSON === 'function' ? (review as any).toJSON() : review;
      res.status(201).json({ success: true, message: 'Cảm ơn bạn đã gửi đánh giá!', data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Không thể gửi đánh giá' });
    }
  }

  // Notifications
  public async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || 'user-stu-1';
      const notifications = await interactionService.getNotifications(userId);
      const data = notifications.map((n: any) => (typeof n?.toJSON === 'function' ? n.toJSON() : n));
      res.json({ success: true, total: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải thông báo', error: err.message });
    }
  }

  public async markAsRead(req: AuthenticatedRequest, res: Response) {
    const ok = await interactionService.markAsRead(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }
    res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
  }

  public async pushNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const notif = await interactionService.createNotification(req.body);
      const data = typeof (notif as any)?.toJSON === 'function' ? (notif as any).toJSON() : notif;
      res.status(201).json({ success: true, message: 'Đã gửi thông báo thành công', data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi gửi thông báo', error: err.message });
    }
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
