import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';
import { Canteen } from './Canteen';
import { UserVoucher } from './UserVoucher';
import { User } from './User';
import { Order } from './Order';

export type VoucherDiscountType = 'PERCENT' | 'FIXED' | 'PERCENTAGE';

@Table({ tableName: 'vouchers', timestamps: false, underscored: true })
export class Voucher extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
  declare code: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare description: string;

  @ForeignKey(() => Canteen)
  @Column({ type: DataType.STRING(50), allowNull: true, field: 'canteen_id' })
  declare canteenId?: string;

  @Column({ type: DataType.STRING(20), allowNull: false, field: 'discount_type' })
  declare discountType: VoucherDiscountType;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, field: 'discount_value' })
  declare discountValue: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0, field: 'min_order_amount' })
  declare minOrderAmount: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true, field: 'max_discount' })
  declare maxDiscount?: number;

  @Column({ type: DataType.DATE, allowNull: true, field: 'start_date' })
  declare startDate: Date;

  @Column({ type: DataType.DATE, allowNull: true, field: 'end_date' })
  declare endDate: Date;

  @Column({ type: DataType.INTEGER, defaultValue: 100, field: 'usage_limit' })
  declare usageLimit: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'used_count' })
  declare usedCount: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true, field: 'is_active' })
  declare isActive: boolean;

  // Associations
  @BelongsTo(() => Canteen)
  declare canteen?: Canteen;

  @HasMany(() => UserVoucher)
  declare userVouchers: UserVoucher[];

  @BelongsToMany(() => User, () => UserVoucher)
  declare users: User[];

  @HasMany(() => Order)
  declare orders: Order[];

  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      code: values.code,
      title: values.title,
      description: values.description,
      canteenId: values.canteenId,
      discountType: values.discountType,
      discountValue: Number(values.discountValue) || 0,
      minOrderAmount: Number(values.minOrderAmount) || 0,
      maxDiscount: values.maxDiscount ? Number(values.maxDiscount) : undefined,
      startDate: values.startDate ? new Date(values.startDate).toISOString() : new Date().toISOString(),
      endDate: values.endDate ? new Date(values.endDate).toISOString() : new Date().toISOString(),
      usageLimit: Number(values.usageLimit) || 0,
      usedCount: Number(values.usedCount) || 0,
      isActive: Boolean(values.isActive),
    };
  }
}
