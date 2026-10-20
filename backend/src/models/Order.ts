import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  HasOne,
} from 'sequelize-typescript';

import type {
  OrderType,
  OrderStatus,
  PaymentMethod,
} from '../types/order.types';

import { User } from './User';
import { Canteen } from './Canteen';
import { Voucher } from './Voucher';
import { DiningTable } from './DiningTable';
import { DeliveryAddress } from './DeliveryAddress';
import { OrderDetail } from './OrderDetail';
import { Payment } from './Payment';
import { Review } from './Review';

@Table({ tableName: 'orders', timestamps: true, underscored: true })
export class Order extends Model {
  // ---------------------------------------------------------------------------
  // PRIMARY KEY
  // ---------------------------------------------------------------------------

  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(30), allowNull: false, unique: true })
  declare orderCode: string;

  // ---------------------------------------------------------------------------
  // USER INFO
  // ---------------------------------------------------------------------------

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(50), allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare userName: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare userPhone: string;

  // ---------------------------------------------------------------------------
  // CANTEEN INFO
  // ---------------------------------------------------------------------------

  @ForeignKey(() => Canteen)
  @Column({ type: DataType.STRING(50), allowNull: false })
  declare canteenId: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare canteenName: string;

  // ---------------------------------------------------------------------------
  // VOUCHER + AMOUNTS
  // ---------------------------------------------------------------------------

  @ForeignKey(() => Voucher)
  @Column({ type: DataType.STRING(50), allowNull: true })
  declare voucherId?: string;

  /** Tổng tiền món TRƯỚC giảm giá */
  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  declare totalAmount: number;

  /** Số tiền được giảm từ voucher */
  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0 })
  declare discountAmount: number;

  /** Số tiền user phải trả = totalAmount - discountAmount */
  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  declare finalAmount: number;

  // ---------------------------------------------------------------------------
  // STATUS + TYPE
  // ---------------------------------------------------------------------------

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
  })
  declare orderType: OrderType;

  // ---------------------------------------------------------------------------
  // TABLE (DINE_IN)
  // ---------------------------------------------------------------------------

  @ForeignKey(() => DiningTable)
  @Column({ type: DataType.STRING(50), allowNull: true })
  declare tableId?: string;

  @Column({ type: DataType.STRING(30), allowNull: true })
  declare tableNumber?: string;

  // ---------------------------------------------------------------------------
  // PICKUP (TAKEAWAY)
  // ---------------------------------------------------------------------------

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare pickupSlot?: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare pickupCode?: string;

  // ---------------------------------------------------------------------------
  // DELIVERY
  // ---------------------------------------------------------------------------

  @ForeignKey(() => DeliveryAddress)
  @Column({ type: DataType.STRING(50), allowNull: true })
  declare deliveryAddressId?: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare deliveryAddressText?: string;

  // ---------------------------------------------------------------------------
  // PAYMENT
  // ---------------------------------------------------------------------------

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare paymentMethod: PaymentMethod;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isPaid: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  declare paidAt?: Date;

  // ---------------------------------------------------------------------------
  // NOTES
  // ---------------------------------------------------------------------------

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes?: string;

  // ---------------------------------------------------------------------------
  // ASSOCIATIONS
  // ---------------------------------------------------------------------------

  @BelongsTo(() => User)
  declare user?: User;

  @BelongsTo(() => Canteen)
  declare canteen?: Canteen;

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

  // ---------------------------------------------------------------------------
  // TO JSON
  // ---------------------------------------------------------------------------

  public toJSON() {
    const values: any = { ...this.get() };
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

      orderDetails: (details || []).map((detail: any) =>
        typeof detail?.toJSON === 'function' ? detail.toJSON() : detail
      ),
      items: (details || []).map((detail: any, idx: number) => {
        const d = typeof detail?.toJSON === 'function' ? detail.toJSON() : detail;
        return {
          id: d.id || `item-${values.id}-${idx}`,
          food: {
            id: d.productId,
            name: d.productName,
            price: Number(d.unitPrice) || 0,
            image: d.productImage || '',
            canteenId: values.canteenId,
            canteenName: values.canteenName,
          },
          quantity: d.quantity || 1,
          unitPrice: Number(d.unitPrice) || 0,
          notes: d.notes || '',
        };
      }),

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
      paidAt: values.paidAt
        ? new Date(values.paidAt).toISOString()
        : null,

      notes: values.notes,

      createdAt: values.createdAt
        ? new Date(values.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: values.updatedAt
        ? new Date(values.updatedAt).toISOString()
        : new Date().toISOString(),
    };
  }
}