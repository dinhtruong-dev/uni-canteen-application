import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Product } from './Product';
import { DiningTable } from './DiningTable';
import { PickupSlot } from './PickupSlot';
import { Order } from './Order';
import { Banner } from './Banner';
import { FlashSale } from './FlashSale';
import { Voucher } from './Voucher';

@Table({ tableName: 'canteens', timestamps: false, underscored: true })
export class Canteen extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(150), allowNull: true, field: 'display_name' })
  declare displayName: string;

  @Column({ type: DataType.STRING(30), allowNull: false, unique: true })
  declare code: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare location: string;

  @Column({ type: DataType.STRING(50), defaultValue: '150m' })
  declare distance: string;

  @Column({ type: DataType.STRING(50), defaultValue: '10 phút' })
  declare duration: string;

  @Column({ type: DataType.STRING(100), defaultValue: '06:30 - 21:00', field: 'opening_hours' })
  declare openingHours: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true, field: 'is_open' })
  declare isOpen: boolean;

  @Column({ type: DataType.DECIMAL(2, 1), defaultValue: 5.0 })
  declare rating?: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'review_count' })
  declare reviewCount: number;

  @Column({ type: DataType.STRING(50), allowNull: true, field: 'sold_count' })
  declare soldCount: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare voucher: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare freeship: string;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare image: string;

  @Column({ type: DataType.INTEGER, defaultValue: 30, field: 'total_tables' })
  declare totalTables: number;

  @Column({ type: DataType.STRING(30), allowNull: true })
  declare phone: string;

  // Associations
  @HasMany(() => Product)
  declare products: Product[];

  @HasMany(() => DiningTable)
  declare tables: DiningTable[];

  @HasMany(() => PickupSlot)
  declare pickupSlots: PickupSlot[];

  @HasMany(() => Order)
  declare orders: Order[];

  @HasMany(() => Banner)
  declare banners: Banner[];

  @HasMany(() => FlashSale)
  declare flashSales: FlashSale[];

  @HasMany(() => Voucher)
  declare vouchers: Voucher[];

  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      name: values.name,
      displayName: values.displayName || values.name,
      code: values.code,
      location: values.location,
      distance: values.distance,
      duration: values.duration,
      openingHours: values.openingHours,
      isOpen: Boolean(values.isOpen),
      rating: Number(values.rating) || 5.0,
      reviewCount: Number(values.reviewCount) || 0,
      soldCount: values.soldCount,
      voucher: values.voucher,
      freeship: values.freeship,
      image: values.image,
      totalTables: Number(values.totalTables) || 30,
      phone: values.phone,
    };
  }
}
