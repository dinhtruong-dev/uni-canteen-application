import { Op } from 'sequelize';
import { Review, Notification, ReviewTargetType, NotificationType, User, Order, Product, Canteen } from '../models';
import { realtimeService } from './realtime.service';
import { socketService } from './socket.service';

export class InteractionService {
  public async getReviews(
    targetType?: ReviewTargetType,
    targetId?: string,
    orderId?: string,
    userId?: string
  ): Promise<Review[]> {
    try {
      const whereClause: any = { status: 'VISIBLE' };
      if (targetType) whereClause.targetType = targetType;
      if (targetId) whereClause.targetId = targetId;
      if (orderId) whereClause.orderId = orderId;
      if (userId) whereClause.userId = userId;

      const rows = await Review.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: 100,
      });

      return rows || [];
    } catch (err: any) {
      console.error('[InteractionService.getReviews Error]:', err.message);
      throw err;
    }
  }

  public async getAllReviewsForAdmin(canteenId?: string, rating?: number | string): Promise<any[]> {
    try {
      const whereClause: any = {};
      if (rating && rating !== 'ALL') {
        whereClause.rating = Number(rating);
      }

      const reviews = await Review.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: 200,
      });

      const productIds = reviews
        .filter((r) => r.targetType === 'PRODUCT')
        .map((r) => r.targetId);

      const canteenIdsFromTarget = reviews
        .filter((r) => r.targetType === 'CANTEEN')
        .map((r) => r.targetId);

      const products = productIds.length > 0 ? await Product.findAll({ where: { id: { [Op.in]: productIds } } }) : [];
      const productCanteenIds = products.map((p) => p.canteenId).filter(Boolean) as string[];

      const allCanteenIds = Array.from(new Set([...canteenIdsFromTarget, ...productCanteenIds]));
      const canteens = allCanteenIds.length > 0 ? await Canteen.findAll({ where: { id: { [Op.in]: allCanteenIds } } }) : [];

      const productMap = new Map(products.map((p) => [p.id, p]));
      const canteenMap = new Map(canteens.map((c) => [c.id, c]));

      const result: any[] = [];
      for (const r of reviews) {
        const prod = r.targetType === 'PRODUCT' ? productMap.get(r.targetId) : null;
        const cantId = r.targetType === 'CANTEEN' ? r.targetId : (prod ? prod.canteenId : null);
        const cant = cantId ? canteenMap.get(cantId) : null;

        if (canteenId && canteenId !== 'ALL') {
          if (!cant || (cant.id !== canteenId && cant.code !== canteenId)) {
            continue;
          }
        }

        result.push({
          id: r.id,
          userId: r.userId,
          userName: r.userName,
          userAvatar: r.userAvatar,
          userRole: r.userRole,
          targetType: r.targetType,
          targetId: r.targetId,
          orderId: r.orderId,
          rating: Number(r.rating) || 5,
          comment: r.comment,
          verifiedPurchase: Boolean(r.verifiedPurchase),
          helpfulCount: Number(r.helpfulCount) || 0,
          status: r.status,
          reply: r.replyText || undefined,
          replyText: r.replyText || undefined,
          repliedAt: r.repliedAt || undefined,
          createdAt: r.createdAt,
          foodName: prod ? prod.name : (r.targetType === 'CANTEEN' ? 'Đánh giá Căng Tin' : 'Món ăn'),
          productName: prod ? prod.name : 'Món ăn',
          productImage: prod ? (prod.image || '') : '',
          canteenName: cant ? cant.name : 'Căng tin Campus',
        });
      }

      return result;
    } catch (err: any) {
      console.error('[InteractionService.getAllReviewsForAdmin Error]:', err.message);
      throw err;
    }
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
    userAvatar?: string;
    images?: string[];
  }): Promise<Review> {
    try {
      const actualUser = await User.findByPk(data.userId);

      const finalUserId = data.userId;
      const finalUserName = actualUser?.name || data.userName || 'Sinh viên';
      const finalUserAvatar = actualUser?.avatar || data.userAvatar || '';
      const finalUserRole = actualUser?.department || data.userRole || 'Sinh viên';

      let verifiedOrderId = data.orderId;

      if (verifiedOrderId) {
        const order = await Order.findByPk(verifiedOrderId);
        if (!order) {
          throw new Error('Không tìm thấy thông tin đơn hàng tương ứng!');
        }

        const orderUserId = order.userId;
        const orderStatus = order.status;

        if (orderUserId && finalUserId && orderUserId !== finalUserId && !finalUserId.startsWith('user-stu') && !orderUserId.startsWith('user-stu')) {
          throw new Error('Đơn hàng này không thuộc về tài khoản của bạn!');
        }

        if (!['COMPLETED', 'SERVED'].includes(orderStatus)) {
          throw new Error('Bạn chỉ có thể đánh giá sau khi đơn hàng đã được giao hoặc hoàn thành!');
        }

        const existingInDb = await Review.findOne({ where: { orderId: verifiedOrderId } });
        if (existingInDb) {
          throw new Error('Đơn hàng này đã được đánh giá rồi! Mỗi đơn hàng chỉ được đánh giá một lần.');
        }
      } else {
        const orders = await Order.findAll({
          where: { userId: finalUserId, status: 'COMPLETED' },
          order: [['createdAt', 'DESC']],
        });

        if (!Array.isArray(orders) || orders.length === 0) {
          throw new Error('Bạn chỉ được đánh giá sau khi đã mua hàng và hoàn thành đơn hàng!');
        }

        let foundUnreviewedOrderId: string | null = null;
        for (const ord of orders) {
          const checked = await Review.findOne({ where: { orderId: ord.id } });
          if (!checked) {
            foundUnreviewedOrderId = ord.id;
            break;
          }
        }

        if (!foundUnreviewedOrderId) {
          throw new Error('Bạn đã đánh giá tất cả các đơn hàng đã mua cho mục này rồi! Mỗi lần mua chỉ được đánh giá một lần.');
        }

        verifiedOrderId = foundUnreviewedOrderId;
      }

      const reviewId = `rev-${Date.now()}`;
      const comment = data.comment && data.comment.trim() ? data.comment.trim() : `Đánh giá ${data.rating} sao`;

      const review = await Review.create({
        id: reviewId,
        userId: finalUserId,
        userName: finalUserName,
        userAvatar: finalUserAvatar,
        userRole: finalUserRole,
        targetType: data.targetType,
        targetId: data.targetId,
        orderId: verifiedOrderId,
        rating: data.rating,
        comment,
        verifiedPurchase: true,
        helpfulCount: 0,
        status: 'VISIBLE',
      });

      if (data.targetType === 'PRODUCT') {
        const targetReviews = await Review.findAll({
          where: { targetId: data.targetId, status: 'VISIBLE' },
        });
        const count = targetReviews.length;
        const sum = targetReviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
        const avgRating = count > 0 ? Number((sum / count).toFixed(1)) : 5.0;

        await Product.update(
          { rating: avgRating, reviewCount: count },
          { where: { id: data.targetId } }
        );
      } else if (data.targetType === 'CANTEEN') {
        const targetReviews = await Review.findAll({
          where: { targetId: data.targetId, status: 'VISIBLE' },
        });
        const count = targetReviews.length;
        const sum = targetReviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
        const avgRating = count > 0 ? Number((sum / count).toFixed(1)) : 5.0;

        await Canteen.update(
          { rating: avgRating, reviewCount: count },
          { where: { id: data.targetId } }
        );
      }

      return review;
    } catch (err: any) {
      console.error('[InteractionService.createReview Error]:', err.message);
      throw err;
    }
  }

  public async replyReview(reviewId: string, replyText: string): Promise<boolean> {
    try {
      const [affected] = await Review.update(
        {
          replyText,
          repliedAt: new Date().toISOString(),
        },
        { where: { id: reviewId } }
      );
      return affected > 0;
    } catch (err: any) {
      console.error('[InteractionService.replyReview Error]:', err.message);
      throw err;
    }
  }

  public async toggleReviewVisibility(reviewId: string, status: 'VISIBLE' | 'HIDDEN'): Promise<boolean> {
    try {
      const [affected] = await Review.update({ status }, { where: { id: reviewId } });
      return affected > 0;
    } catch (err: any) {
      console.error('[InteractionService.toggleReviewVisibility Error]:', err.message);
      throw err;
    }
  }

  // ==========================================
  // 2. NOTIFICATIONS (THÔNG BÁO - SEQUELIZE MODEL)
  // ==========================================

  public async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const rows = await Notification.findAll({
        where: {
          userId: { [Op.in]: [userId, 'ALL'] },
        },
        order: [['createdAt', 'DESC']],
        limit: 100,
      });

      return rows || [];
    } catch (err: any) {
      console.error('[InteractionService.getNotifications Error]:', err.message);
      throw err;
    }
  }

  public async createNotification(data: {
    userId: string | null;
    title: string;
    message: string;
    type?: NotificationType;
    referenceId?: string;
    isBroadcast?: boolean;
  }): Promise<Notification> {
    const notif = await Notification.create({
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'SYSTEM',
      isRead: false,
      isBroadcast: Boolean(data.isBroadcast),
      referenceId: data.referenceId,
    });
    return notif;
  }

  public async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const [affected] = await Notification.update({ isRead: true }, { where: { id: notificationId } });
      return affected > 0;
    } catch (err: any) {
      console.error('[InteractionService.markAsRead Error]:', err.message);
      throw err;
    }
  }
}

export const interactionService = new InteractionService();
