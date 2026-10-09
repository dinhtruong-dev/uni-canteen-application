import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Voucher } from './Voucher';

@Table({ tableName: 'user_vouchers', timestamps: true, updatedAt: false, underscored: true })
export class UserVoucher extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'user_id' })
  declare userId: string;

  @ForeignKey(() => Voucher)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'voucher_id' })
  declare voucherId: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'is_used' })
  declare isUsed: boolean;

  @Column({ type: DataType.DATE, allowNull: true, field: 'used_at' })
  declare usedAt?: Date;

  // Associations
  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Voucher)
  declare voucher?: Voucher;

  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      userId: values.userId,
      voucherId: values.voucherId,
      isUsed: Boolean(values.isUsed),
      usedAt: values.usedAt ? new Date(values.usedAt).toISOString() : undefined,
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
      voucher: this.voucher || values.voucher
        ? typeof (this.voucher || values.voucher)?.toJSON === 'function'
          ? (this.voucher || values.voucher).toJSON()
          : this.voucher || values.voucher
        : undefined,
    };
  }
}
