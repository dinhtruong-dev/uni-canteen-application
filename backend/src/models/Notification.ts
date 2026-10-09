import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

export type NotificationType = 'ORDER_STATUS' | 'SYSTEM' | 'PROMOTION' | 'WALLET' | 'ORDER';

@Table({ tableName: 'notifications', timestamps: true, updatedAt: false, underscored: true })
export class Notification extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(50), allowNull: true, field: 'user_id' })
  declare userId: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare message: string;

  @Column({
    type: DataType.ENUM('ORDER', 'ORDER_STATUS', 'SYSTEM', 'PROMOTION', 'WALLET'),
    defaultValue: 'SYSTEM',
  })
  declare type: NotificationType;

  @Column({ type: DataType.STRING(50), allowNull: true, field: 'reference_id' })
  declare referenceId?: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'is_read' })
  declare isRead: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isBroadcast: boolean;

  // Associations
  @BelongsTo(() => User)
  declare user: User;

  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      userId: values.userId,
      title: values.title,
      message: values.message,
      type: values.type,
      referenceId: values.referenceId,
      isRead: Boolean(values.isRead),
      isBroadcast: Boolean(values.isBroadcast),
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}
