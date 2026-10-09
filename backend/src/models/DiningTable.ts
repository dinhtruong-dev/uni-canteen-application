import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Canteen } from './Canteen';
import { Order } from './Order';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

@Table({ tableName: 'dining_tables', timestamps: true, createdAt: false, underscored: true })
export class DiningTable extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(30), allowNull: false, field: 'table_number' })
  declare tableNumber: string;

  @ForeignKey(() => Canteen)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'canteen_id' })
  declare canteenId: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: 'canteen_name' })
  declare canteenName: string;

  @Column({ type: DataType.STRING(500), allowNull: false, field: 'qr_code' })
  declare qrCode: string;

  @Column({ type: DataType.INTEGER, defaultValue: 4 })
  declare capacity: number;

  @Column({ type: DataType.STRING(100), defaultValue: 'Khu vực chính' })
  declare area: string;

  @Column({
    type: DataType.ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'),
    defaultValue: 'AVAILABLE',
  })
  declare status: TableStatus;

  @ForeignKey(() => Order)
  @Column({ type: DataType.STRING(50), allowNull: true, field: 'current_order_id' })
  declare currentOrderId?: string;

  // Associations
  @BelongsTo(() => Canteen)
  declare canteen: Canteen;

  @HasMany(() => Order)
  declare orders: Order[];

  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      tableNumber: values.tableNumber,
      canteenId: values.canteenId,
      canteenName: values.canteenName,
      qrCode: values.qrCode,
      capacity: Number(values.capacity) || 4,
      area: values.area,
      status: values.status,
      currentOrderId: values.currentOrderId,
      updatedAt: values.updatedAt ? new Date(values.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}
