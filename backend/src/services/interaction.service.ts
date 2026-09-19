import { db } from './database.service';
import { Review, Notification, ReviewTargetType, NotificationType } from '../models';
import { realtimeService } from './realtime.service';

export class InteractionService {
  // Reviews
  public getReviews(targetType?: ReviewTargetType, targetId?: string): Review[] {
    let list = Array.from(db.reviews.values());
    if (targetType) list = list.filter((r) => r.targetType === targetType);
    if (targetId) list = list.filter((r) => r.targetId === targetId);
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public createReview(data: {
    userId: string;
    userName: string;
    targetType: ReviewTargetType;
    targetId: string;
    rating: number;
    comment: string;
    userRole?: string;
    images?: string[];
  }): Review {
    const reviewId = `rev-${Date.now()}`;
    const review = new Review(
      reviewId,
      data.userId,
      data.userName,
      data.targetType,
      data.targetId,
      data.rating,
      data.comment,
      {
        userRole: data.userRole || 'Sinh viên',
        images: data.images,
      }
    );

    db.reviews.set(review.id, review);

    // Update Product or Canteen Rating
    if (data.targetType === 'PRODUCT') {
      const prod = db.products.get(data.targetId);
      if (prod) {
        const totalScore = prod.rating * prod.reviewCount + data.rating;
        prod.reviewCount += 1;
        prod.rating = Math.round((totalScore / prod.reviewCount) * 10) / 10;
      }
    }

    return review;
  }

  // Notifications
  public getNotifications(userId: string): Notification[] {
    return Array.from(db.notifications.values())
      .filter((n) => n.userId === userId || n.userId === 'ALL')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    referenceId?: string;
  }): Notification {
    const notif = new Notification(
      `notif-${Date.now()}`,
      data.userId,
      data.title,
      data.message,
      data.type || 'SYSTEM',
      data.referenceId
    );

    db.notifications.set(notif.id, notif);

    if (data.userId === 'ALL') {
      realtimeService.broadcast('notification:new', notif.toJSON());
    } else {
      realtimeService.sendToUser(data.userId, 'notification:new', notif.toJSON());
    }

    return notif;
  }

  public markAsRead(notificationId: string): boolean {
    const notif = db.notifications.get(notificationId);
    if (!notif) return false;
    notif.markAsRead();
    return true;
  }
}

export const interactionService = new InteractionService();
