export type FavoriteTargetType = 'PRODUCT' | 'ORDER';

export class Favorite {
  public id: string;
  public userId: string;
  public targetType: FavoriteTargetType;
  public targetId: string; // productId or orderId
  public createdAt: Date;

  constructor(
    id: string,
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.targetType = targetType;
    this.targetId = targetId;
    this.createdAt = createdAt;
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      targetType: this.targetType,
      targetId: this.targetId,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
