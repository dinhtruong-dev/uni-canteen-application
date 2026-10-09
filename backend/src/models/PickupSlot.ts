import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Canteen } from './Canteen';

export type PickupSlotStatus = 'AVAILABLE' | 'FULL' | 'DISABLED';

@Table({ tableName: 'pickup_slots', timestamps: true, underscored: true })
export class PickupSlot extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  public id!: string;

  @ForeignKey(() => Canteen)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'canteen_id' })
  public canteenId!: string;

  @Column({ type: DataType.STRING(50), allowNull: false, field: 'time_range' })
  public timeRange!: string;

  @Column({ type: DataType.INTEGER, defaultValue: 30, field: 'max_orders' })
  public maxOrders!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'current_orders' })
  public currentOrders!: number;

  @Column({
    type: DataType.ENUM('AVAILABLE', 'FULL', 'DISABLED'),
    defaultValue: 'AVAILABLE',
  })
  public status!: PickupSlotStatus;

  // Associations
  @BelongsTo(() => Canteen)
  public canteen!: Canteen;

  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      canteenId: values.canteenId,
      timeRange: values.timeRange,
      maxOrders: Number(values.maxOrders) || 20,
      currentOrders: Number(values.currentOrders) || 0,
      status: values.status,
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: values.updatedAt ? new Date(values.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}
