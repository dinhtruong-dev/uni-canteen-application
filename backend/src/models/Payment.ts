import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import type { PaymentMethod, PaymentStatus } from '../types/order.types';
import { Order } from './Order';
import { User } from './User';

@Table({ tableName: 'payments', timestamps: true, updatedAt: false, underscored: true })
export class Payment extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @ForeignKey(() => Order)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'order_id' })
  declare orderId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'user_id' })
  declare userId: string;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  declare amount: number;

  @Column({
    type: DataType.ENUM(
      'STUDENT_WALLET',
      'CAMPUS_WALLET',
      'MOMO',
      'ZALOPAY',
      'VNPAY_QR',
      'VNPAY',
      'CASH'
    ),
    allowNull: false,
    field: 'method',
  })
  declare method: PaymentMethod;

  @Column({
    type: DataType.ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'),
    defaultValue: 'PENDING',
  })
  declare status: PaymentStatus;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true, field: 'transaction_code' })
  declare transactionCode: string;

  @Column({ type: DataType.JSON, allowNull: true, field: 'gateway_response_json' })
  declare gatewayResponse?: Record<string, any>;

  @Column({ type: DataType.DATE, allowNull: true, field: 'paid_at' })
  declare paidAt?: Date;

  // Associations
  @BelongsTo(() => Order)
  declare order: Order;

  @BelongsTo(() => User)
  declare user: User;

  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      orderId: values.orderId,
      userId: values.userId,
      amount: Number(values.amount) || 0,
      method: values.method,
      status: values.status,
      transactionCode: values.transactionCode,
      gatewayResponse: values.gatewayResponse,
      paidAt: values.paidAt ? new Date(values.paidAt).toISOString() : null,
      createdAt: values.createdAt
        ? new Date(values.createdAt).toISOString()
        : new Date().toISOString(),
    };
  }
}