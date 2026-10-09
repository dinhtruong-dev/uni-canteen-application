import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import { User } from './User';
import { Canteen } from './Canteen';
import { Voucher } from './Voucher';
import { DiningTable } from './DiningTable';
import { DeliveryAddress } from './DeliveryAddress';
import { OrderDetail } from './OrderDetail';
import { Payment } from './Payment';
import { Review } from './Review';
import { OrderType, OrderStatus, PaymentMethod } from '../types/order.types';


@Table({ tableName: 'orders', timestamps: true, underscored: true })
export class Order extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(30), allowNull: false, unique: true, field: 'order_code' })
  declare orderCode: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'user_id' })
  declare userId: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: 'user_name' })
  declare userName: string;

  @Column({ type: DataType.STRING(20), allowNull: false, field: 'user_phone' })
  declare userPhone: string;

  @ForeignKey(() => Canteen)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'canteen_id' })
  declare canteenId: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: 'canteen_name' })
  declare canteenName: string;

  @ForeignKey(() => Voucher)
  @Column({ type: DataType.STRING(50), allowNull: true, field: 'voucher_id' })
  declare voucherId?: string;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false, field: 'total_amount' })
  declare totalAmount: number;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0, field: 'discount_amount' })
  declare discountAmount: number;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false, field: 'final_amount' })
  declare finalAmount: number;

  @Column({
    type: DataType.ENUM(
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'WAITING_PICKUP',
      'DELIVERING',
      'SERVED',
      'COMPLETED',
      'CANCELLED'
    ),
    defaultValue: 'PENDING',
  })
  declare status: OrderStatus;

  @Column({
    type: DataType.ENUM('DINE_IN', 'TAKEAWAY', 'DELIVERY'),
    allowNull: false,
    field: 'order_type',
  })
  declare orderType: OrderType;

  @ForeignKey(() => DiningTable)
  @Column({ type: DataType.STRING(50), allowNull: true, field: 'table_id' })
  declare tableId?: string;

  @Column({ type: DataType.STRING(30), allowNull: true, field: 'table_number' })
  declare tableNumber?: string;

  @Column({ type: DataType.STRING(50), allowNull: true, field: 'pickup_slot' })
  declare pickupSlot?: string;

  @Column({ type: DataType.STRING(50), allowNull: true, field: 'pickup_code' })
  declare pickupCode?: string;

  @ForeignKey(() => DeliveryAddress)
  @Column({ type: DataType.STRING(50), allowNull: true, field: 'delivery_address_id' })
  declare deliveryAddressId?: string;

  @Column({ type: DataType.STRING(255), allowNull: true, field: 'delivery_address_text' })
  declare deliveryAddressText?: string;

  @Column({ type: DataType.STRING(50), allowNull: false, field: 'payment_method' })
  declare paymentMethod: PaymentMethod;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'is_paid' })
  declare isPaid: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes?: string;

  // Associations
  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Canteen)
  declare canteen: Canteen;

  @BelongsTo(() => Voucher)
  declare voucher?: Voucher;

  @BelongsTo(() => DiningTable)
  declare table?: DiningTable;

  @BelongsTo(() => DeliveryAddress)
  declare deliveryAddress?: DeliveryAddress;

  @HasMany(() => OrderDetail)
  declare orderDetails?: OrderDetail[];

  @HasOne(() => Payment)
  declare payment?: Payment;

  @HasMany(() => Review)
  declare reviews?: Review[];

  public toJSON() {
    const values = { ...this.get() };
    const details = this.orderDetails || values.orderDetails || [];
    return {
      id: values.id,
      orderCode: values.orderCode,
      userId: values.userId,
      userName: values.userName,
      userPhone: values.userPhone,
      canteenId: values.canteenId,
      canteenName: values.canteenName,
      voucherId: values.voucherId,
      orderDetails: (details || []).map((detail: any) => (typeof detail?.toJSON === 'function' ? detail.toJSON() : detail)),
      totalAmount: Number(values.totalAmount) || 0,
      discountAmount: Number(values.discountAmount) || 0,
      finalAmount: Number(values.finalAmount) || 0,
      status: values.status,
      orderType: values.orderType,
      tableId: values.tableId,
      tableNumber: values.tableNumber,
      pickupSlot: values.pickupSlot,
      pickupCode: values.pickupCode,
      deliveryAddressId: values.deliveryAddressId,
      deliveryAddressText: values.deliveryAddressText,
      paymentMethod: values.paymentMethod,
      isPaid: Boolean(values.isPaid),
      notes: values.notes,
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: values.updatedAt ? new Date(values.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}
