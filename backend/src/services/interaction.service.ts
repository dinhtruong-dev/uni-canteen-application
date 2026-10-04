import { db } from './database.service';
import { Review, Notification, ReviewTargetType, NotificationType } from '../models';
import { realtimeService } from './realtime.service';
import { socketService } from './socket.service';
import { executeQuery } from '../config/db.config';

export class InteractionService {
  // ==========================================
  // 1. REVIEWS (ĐÁNH GIÁ - LIÊN KẾT TRỰC TIẾP DB MYSQL)
  // ==========================================

  public async getReviews(targetType?: ReviewTargetType, targetId?: string): Promise<Review[]> {
    try {
      let sql = `SELECT * FROM reviews WHERE status = 'VISIBLE'`;
      const params: any[] = [];
      if (targetType) {
        sql += ` AND target_type = ?`;
        params.push(targetType);
      }
      if (targetId) {
        sql += ` AND target_id = ?`;
        params.push(targetId);
      }
      sql += ` ORDER BY created_at DESC LIMIT 100`;

      const rows = await executeQuery(sql, params);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any) => {
          const rev = new Review(
            r.id,
            r.user_id,
            r.user_name,
            r.target_type,
            r.target_id,
            Number(r.rating) || 5,
            r.comment,
            {
              verifiedPurchase: Boolean(r.verified_purchase),
              helpfulCount: Number(r.helpful_count) || 0,
              status: r.status,
            }
          );
          (rev as any).createdAt = new Date(r.created_at);
          (rev as any).reply = r.reply_text || undefined;
          (rev as any).repliedAt = r.replied_at || undefined;
          return rev;
        });
      }
    } catch (err: any) {
      console.warn('[InteractionService] MySQL getReviews error, using cache:', err.message);
    }

    let list = Array.from(db.reviews.values());
    if (targetType) list = list.filter((r) => r.targetType === targetType);
    if (targetId) list = list.filter((r) => r.targetId === targetId);
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getAllReviewsForAdmin(canteenId?: string, rating?: number | string): Promise<any[]> {
    try {
      let sql = `
        SELECT r.*, p.name as product_name, p.image as product_image, c.name as canteen_name
        FROM reviews r
        LEFT JOIN products p ON r.target_type = 'PRODUCT' AND r.target_id = p.id
        LEFT JOIN canteens c ON (r.target_type = 'CANTEEN' AND r.target_id = c.id) OR (p.canteen_id = c.id)
        WHERE 1=1
      `;
      const params: any[] = [];
      if (canteenId && canteenId !== 'ALL') {
        sql += ` AND (c.id = ? OR c.code = ?)`;
        params.push(canteenId, canteenId);
      }
      if (rating && rating !== 'ALL') {
        sql += ` AND r.rating = ?`;
        params.push(Number(rating));
      }
      sql += ` ORDER BY r.created_at DESC LIMIT 200`;

      const rows = await executeQuery(sql, params);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          userName: r.user_name,
          targetType: r.target_type,
          targetId: r.target_id,
          rating: Number(r.rating) || 5,
          comment: r.comment,
          verifiedPurchase: Boolean(r.verified_purchase),
          helpfulCount: Number(r.helpful_count) || 0,
          status: r.status,
          reply: r.reply_text || undefined,
          repliedAt: r.replied_at || undefined,
          createdAt: r.created_at,
          foodName: r.product_name || (r.target_type === 'CANTEEN' ? 'Đánh giá Căng Tin' : 'Món ăn'),
          productName: r.product_name || 'Món ăn',
          productImage: r.product_image || '',
          canteenName: r.canteen_name || 'Căng tin Campus',
        }));
      }
    } catch (err: any) {
      console.warn('[InteractionService] MySQL getAllReviewsForAdmin error:', err.message);
    }

    // Fallback in-memory
    return Array.from(db.reviews.values()).map((rev) => {
      const product = db.products.get(rev.targetId);
      const canteen = db.canteens.get(product?.canteenId || rev.targetId);
      return {
        ...rev.toJSON(),
        foodName: product ? product.name : 'Đánh giá Căng Tin',
        productName: product ? product.name : 'Món ăn',
        productImage: product ? product.image : '',
        canteenName: canteen ? canteen.name : 'Căng Tin A2',
      };
    });
  }

  public async createReview(data: {
    userId: string;
    userName: string;
    targetType: ReviewTargetType;
    targetId: string;
    rating: number;
    comment?: string;
    orderId?: string;
    userRole?: string;
    images?: string[];
  }): Promise<Review> {
    const reviewId = `rev-${Date.now()}`;
    const comment = data.comment && data.comment.trim() ? data.comment.trim() : `Đánh giá ${data.rating} sao`;

    const review = new Review(
      reviewId,
      data.userId,
      data.userName,
      data.targetType,
      data.targetId,
      data.rating,
      comment,
      {
        orderId: data.orderId,
        userRole: data.userRole || 'Sinh viên',
        verifiedPurchase: true,
        images: data.images,
      }
    );

    db.reviews.set(review.id, review);

    // Lưu trực tiếp vào MySQL database
    try {
      await executeQuery(
        `INSERT INTO reviews (id, user_id, user_name, target_type, target_id, rating, comment, verified_purchase, helpful_count, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, 'VISIBLE', CURRENT_TIMESTAMP)`,
        [review.id, data.userId, data.userName, data.targetType, data.targetId, data.rating, comment]
      );

      // Cập nhật rating và review_count trong CSDL
      if (data.targetType === 'PRODUCT') {
        const prod = db.products.get(data.targetId);
        if (prod) {
          const totalScore = prod.rating * prod.reviewCount + data.rating;
          prod.reviewCount += 1;
          prod.rating = Math.round((totalScore / prod.reviewCount) * 10) / 10;
        }

        await executeQuery(
          `UPDATE products SET 
             rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE target_id = ? AND status = 'VISIBLE'),
             review_count = (SELECT COUNT(*) FROM reviews WHERE target_id = ? AND status = 'VISIBLE')
           WHERE id = ?`,
          [data.targetId, data.targetId, data.targetId]
        );
      } else if (data.targetType === 'CANTEEN') {
        const cant = db.canteens.get(data.targetId);
        if (cant) {
          const totalScore = cant.rating * cant.reviewCount + data.rating;
          cant.reviewCount += 1;
          cant.rating = Math.round((totalScore / cant.reviewCount) * 10) / 10;
        }

        await executeQuery(
          `UPDATE canteens SET 
             rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE target_id = ? AND status = 'VISIBLE'),
             review_count = (SELECT COUNT(*) FROM reviews WHERE target_id = ? AND status = 'VISIBLE')
           WHERE id = ?`,
          [data.targetId, data.targetId, data.targetId]
        );
      }
    } catch (dbErr: any) {
      console.warn('[InteractionService] MySQL createReview error:', dbErr.message);
    }

    return review;
  }

  public async replyReview(reviewId: string, replyText: string): Promise<boolean> {
    const rev = db.reviews.get(reviewId);
    if (rev) {
      (rev as any).reply = replyText;
      (rev as any).repliedAt = new Date().toISOString();
    }

    try {
      await executeQuery(
        `UPDATE reviews SET reply_text = ?, replied_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [replyText, reviewId]
      );
      return true;
    } catch (err: any) {
      console.warn('[InteractionService] MySQL replyReview error:', err.message);
      return Boolean(rev);
    }
  }

  public async toggleReviewVisibility(reviewId: string, status: 'VISIBLE' | 'HIDDEN'): Promise<boolean> {
    const rev = db.reviews.get(reviewId);
    if (rev) {
      (rev as any).status = status;
    }

    try {
      await executeQuery(`UPDATE reviews SET status = ? WHERE id = ?`, [status, reviewId]);
      return true;
    } catch (err: any) {
      console.warn('[InteractionService] MySQL toggleReviewVisibility error:', err.message);
      return Boolean(rev);
    }
  }

  // ==========================================
  // 2. NOTIFICATIONS (THÔNG BÁO - DB MYSQL & SOCKET.IO)
  // ==========================================

  public async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const rows = await executeQuery(
        `SELECT id, user_id, title, message, type, reference_id, is_read, created_at
         FROM notifications
         WHERE user_id = ? OR user_id = 'ALL'
         ORDER BY created_at DESC
         LIMIT 100`,
        [userId]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map(
          (r: any) =>
            new Notification(
              r.id,
              r.user_id,
              r.title,
              r.message,
              r.type,
              r.reference_id,
              Boolean(r.is_read),
              new Date(r.created_at)
            )
        );
      }
    } catch (err: any) {
      console.warn('[InteractionService] MySQL getNotifications error, using cache:', err.message);
    }

    return Array.from(db.notifications.values())
      .filter((n) => n.userId === userId || n.userId === 'ALL')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    referenceId?: string;
  }): Promise<Notification> {
    const notif = new Notification(
      `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      data.userId,
      data.title,
      data.message,
      data.type || 'SYSTEM',
      data.referenceId
    );

    db.notifications.set(notif.id, notif);

    // 1. Lưu trực tiếp vào bảng notifications trong MySQL
    try {
      await executeQuery(
        `INSERT INTO notifications (id, user_id, title, message, type, reference_id, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [notif.id, notif.userId, notif.title, notif.message, notif.type, notif.referenceId || null, notif.isRead ? 1 : 0]
      );
    } catch (err: any) {
      console.warn('[InteractionService] MySQL insert notification error:', err.message);
    }

    // 2. Bắn Socket.IO và SSE theo thời gian thực tới tất cả máy / đối tượng nhận
    const notifJson = typeof (notif as any)?.toJSON === 'function' ? (notif as any).toJSON() : notif;
    if (data.userId === 'ALL' || data.userId === 'STUDENTS' || data.userId === 'STAFF') {
      realtimeService.broadcast('notification:new', notifJson);
      socketService.broadcastNotification(notifJson);
    } else {
      realtimeService.sendToUser(data.userId, 'notification:new', notifJson);
      socketService.sendNotificationToUser(data.userId, notifJson);
    }

    return notif;
  }

  public async markAsRead(notificationId: string): Promise<boolean> {
    const notif = db.notifications.get(notificationId);
    if (notif) notif.markAsRead();

    try {
      await executeQuery('UPDATE notifications SET is_read = 1 WHERE id = ?', [notificationId]);
      return true;
    } catch {
      return Boolean(notif);
    }
  }
}

export const interactionService = new InteractionService();
