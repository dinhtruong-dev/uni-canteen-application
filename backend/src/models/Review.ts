export type ReviewTargetType = 'PRODUCT' | 'CANTEEN';

export class Review {
  public id: string;
  public userId: string;
  public userName: string;
  public userRole: string;
  public userAvatar?: string;
  public targetType: ReviewTargetType;
  public targetId: string; // productId or canteenId
  public orderId?: string; // Mã đơn hàng đã hoàn thành (bắt buộc hoàn thành đơn để tránh đánh giá tràn lan)
  public rating: number; // 1 to 5
  public comment: string; // Tùy chọn (đã loại bỏ phần viết đánh giá trên UI)
  public verifiedPurchase: boolean;
  public helpfulCount: number;
  public images: string[];
  public createdAt: Date;

  constructor(
    id: string,
    userId: string,
    userName: string,
    targetType: ReviewTargetType,
    targetId: string,
    rating: number,
    comment?: string,
    options?: {
      orderId?: string;
      userRole?: string;
      userAvatar?: string;
      verifiedPurchase?: boolean;
      helpfulCount?: number;
      images?: string[];
      createdAt?: Date;
    }
  ) {
    this.id = id;
    this.userId = userId;
    this.userName = userName;
    this.userRole = options?.userRole || 'Sinh viên';
    this.userAvatar = options?.userAvatar;
    this.targetType = targetType;
    this.targetId = targetId;
    this.orderId = options?.orderId;
    this.rating = Math.max(1, Math.min(5, rating));
    this.comment = comment || '';
    this.verifiedPurchase = options?.verifiedPurchase !== undefined ? options.verifiedPurchase : true;
    this.helpfulCount = options?.helpfulCount || 0;
    this.images = options?.images || [];
    this.createdAt = options?.createdAt || new Date();
  }

  public upvoteHelpful(): number {
    this.helpfulCount += 1;
    return this.helpfulCount;
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      userRole: this.userRole,
      userAvatar: this.userAvatar,
      targetType: this.targetType,
      targetId: this.targetId,
      orderId: this.orderId,
      rating: this.rating,
      comment: this.comment,
      verifiedPurchase: this.verifiedPurchase,
      helpfulCount: this.helpfulCount,
      images: this.images,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
