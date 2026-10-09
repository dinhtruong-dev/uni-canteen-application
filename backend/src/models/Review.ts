import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Order } from './Order';

export type ReviewTargetType = 'PRODUCT' | 'CANTEEN';
export type ReviewStatus = 'VISIBLE' | 'HIDDEN';

@Table({ tableName: 'reviews', timestamps: true, updatedAt: false, underscored: true })
export class Review extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'user_id' })
  declare userId: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: 'user_name' })
  declare userName: string;

  @Column({ type: DataType.ENUM('PRODUCT', 'CANTEEN'), allowNull: false, field: 'target_type' })
  declare targetType: ReviewTargetType;

  @Column({ type: DataType.STRING(50), allowNull: false, field: 'target_id' })
  declare targetId: string;

  @ForeignKey(() => Order)
  @Column({ type: DataType.STRING(50), allowNull: true, field: 'order_id' })
  declare orderId?: string;

  @Column({ type: DataType.INTEGER, defaultValue: 5 })
  declare rating: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare comment: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true, field: 'verified_purchase' })
  declare verifiedPurchase: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'helpful_count' })
  declare helpfulCount: number;

  @Column({ type: DataType.ENUM('VISIBLE', 'HIDDEN'), defaultValue: 'VISIBLE' })
  declare status: ReviewStatus;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'reply_text' })
  declare replyText?: string;

  @Column({ type: DataType.STRING(100), allowNull: true, field: 'replied_at' })
  declare repliedAt?: string;

  // Associations
  @BelongsTo(() => User, { onDelete: 'CASCADE' })
  declare user: User;

  @BelongsTo(() => Order)
  declare order?: Order;

  userRole: string = 'Sinh viên';
  userAvatar?: string;

  toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      userId: values.userId,
      userName: values.userName,
      userRole: this.userRole || 'Sinh viên',
      userAvatar: this.userAvatar,
      targetType: values.targetType,
      targetId: values.targetId,
      orderId: values.orderId,
      rating: Number(values.rating) || 5,
      comment: values.comment,
      verifiedPurchase: Boolean(values.verifiedPurchase),
      helpfulCount: Number(values.helpfulCount) || 0,
      images: [],
      status: values.status,
      replyText: values.replyText,
      reply: values.replyText,
      repliedAt: values.repliedAt,
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}
