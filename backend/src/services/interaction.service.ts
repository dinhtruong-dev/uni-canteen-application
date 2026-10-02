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
    comment?: string;
    orderId?: string;
    userRole?: string;
    images?: string[];
  }): Review {
    // 1. Kiểm tra đơn hàng hoàn thành (COMPLETED) của người dùng để tránh đánh giá tràn lan
    const userOrders = Array.from(db.orders.values()).filter(
      (o) => o.userId === data.userId && o.status === 'COMPLETED'
    );

    let matchingOrder = null;

    if (data.orderId) {
      const explicitOrder = db.orders.get(data.orderId);
      if (!explicitOrder || explicitOrder.userId !== data.userId || explicitOrder.status !== 'COMPLETED') {
        throw new Error('Đơn hàng không tồn tại hoặc chưa được hoàn thành (COMPLETED)!');
      }
      if (data.targetType === 'PRODUCT') {
        const hasProduct = explicitOrder.orderDetails.some((d) => d.productId === data.targetId);
        if (!hasProduct) {
          throw new Error('Món ăn này không nằm trong đơn hàng đã hoàn thành được chọn!');
        }
      } else if (data.targetType === 'CANTEEN') {
        if (explicitOrder.canteenId !== data.targetId) {
          throw new Error('Đơn hàng không thuộc căng tin này!');
        }
      }
      matchingOrder = explicitOrder;
    } else {
      // Tìm đơn hàng COMPLETED hợp lệ của người dùng cho món/căng tin này
      if (data.targetType === 'PRODUCT') {
        matchingOrder = userOrders.find((o) =>
          o.orderDetails.some((d) => d.productId === data.targetId)
        );
      } else if (data.targetType === 'CANTEEN') {
        matchingOrder = userOrders.find((o) => o.canteenId === data.targetId);
      }
    }

    if (!matchingOrder) {
      throw new Error(
        data.targetType === 'PRODUCT'
          ? 'Để tránh đánh giá tràn lan, bạn cần hoàn thành đơn hàng có món này trước khi gửi đánh giá!'
          : 'Để tránh đánh giá tràn lan, bạn cần hoàn thành đơn hàng tại căng tin này trước khi gửi đánh giá!'
      );
    }

    // 2. Chống đánh giá trùng lặp: Mỗi đơn hàng chỉ được đánh giá 1 lần cho món/căng tin đó
    const alreadyReviewed = Array.from(db.reviews.values()).some(
      (r) =>
        r.userId === data.userId &&
        r.targetType === data.targetType &&
        r.targetId === data.targetId &&
        r.orderId === matchingOrder.id
    );

    if (alreadyReviewed) {
      throw new Error('Bạn đã gửi đánh giá cho đơn hàng hoàn thành này rồi!');
    }

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
        orderId: matchingOrder.id,
        userRole: data.userRole || 'Sinh viên',
        verifiedPurchase: true,
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
