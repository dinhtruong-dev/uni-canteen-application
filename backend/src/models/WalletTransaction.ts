import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'wallet_transactions', timestamps: true, updatedAt: false, underscored: true })
export class WalletTransaction extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'user_id' })
  declare userId: string;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  declare amount: number;

  @Column({ type: DataType.ENUM('TOPUP', 'PAYMENT', 'REFUND'), allowNull: false })
  declare type: 'TOPUP' | 'PAYMENT' | 'REFUND';

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare description: string;

  @Column({ type: DataType.ENUM('SUCCESS', 'PENDING', 'FAILED'), defaultValue: 'SUCCESS' })
  declare status: 'SUCCESS' | 'PENDING' | 'FAILED';

  // Associations
  @BelongsTo(() => User)
  declare user: User;

  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      userId: values.userId,
      amount: Number(values.amount) || 0,
      type: values.type,
      description: values.description,
      status: values.status,
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}
