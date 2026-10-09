import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { Order } from './Order';
import { DeliveryAddress } from './DeliveryAddress';
import { Favorite } from './Favorite';
import { UserVoucher } from './UserVoucher';
import { Voucher } from './Voucher';
import { Review } from './Review';
import { Notification } from './Notification';
import { WalletTransaction } from './WalletTransaction';
import { Payment } from './Payment';
import { UserRole, UserStatus } from '../types/auth.types';


@Table({ tableName: 'users', timestamps: true, underscored: true })
export class User extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;


  @Column({ type: DataType.STRING(30), allowNull: true, field: 'student_id' })
  declare studentId?: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(150), allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: 'password_hash' })
  declare passwordHash: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare phone: string;

  @Column({
    type: DataType.ENUM('STUDENT', 'STAFF', 'ADMIN'),
    allowNull: false,
    defaultValue: 'STUDENT',
  })
  declare role: UserRole;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare faculty?: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare department?: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'wallet_balance',
  })
  declare walletBalance: number;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare avatar?: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'BLOCKED', 'BANNED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  })
  declare status: UserStatus;

  // Associations
  @HasMany(() => Order)
  declare orders: Order[];

  @HasMany(() => DeliveryAddress)
  declare deliveryAddresses: DeliveryAddress[];

  @HasMany(() => Favorite)
  declare favorites: Favorite[];

  @HasMany(() => UserVoucher)
  declare userVouchers: UserVoucher[];

  @BelongsToMany(() => Voucher, () => UserVoucher)
  declare vouchers: Voucher[];

  @HasMany(() => Review)
  declare reviews: Review[];

  @HasMany(() => Notification)
  declare notifications: Notification[];

  @HasMany(() => WalletTransaction)
  declare walletTransactions: WalletTransaction[];

  @HasMany(() => Payment)
  declare payments: Payment[];

  public toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return {
      id: values.id,
      studentId: values.studentId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      faculty: values.faculty,
      department: values.department,
      walletBalance: Number(values.walletBalance) || 0,
      avatar: values.avatar,
      status: values.status,
      isActive: values.status === 'ACTIVE',
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: values.updatedAt ? new Date(values.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}
