import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Order } from './Order';

@Table({ tableName: 'delivery_addresses', timestamps: true, updatedAt: false, underscored: true })
export class DeliveryAddress extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'user_id' })
  declare userId: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: 'recipient_name' })
  declare recipientName: string;

  @Column({ type: DataType.STRING(20), allowNull: false, field: 'recipient_phone' })
  declare recipientPhone: string;

  @Column({ type: DataType.STRING(100), allowNull: false, field: 'dorm_block' })
  declare dormBlock: string;

  @Column({ type: DataType.STRING(50), allowNull: false, field: 'room_number' })
  declare roomNumber: string;

  @Column({ type: DataType.STRING(255), allowNull: false, field: 'full_address' })
  declare fullAddress: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare notes?: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'is_default' })
  declare isDefault: boolean;

  // Associations
  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => Order)
  declare orders: Order[];

  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      userId: values.userId,
      recipientName: values.recipientName,
      recipientPhone: values.recipientPhone,
      dormBlock: values.dormBlock,
      roomNumber: values.roomNumber,
      fullAddress: values.fullAddress,
      notes: values.notes,
      isDefault: Boolean(values.isDefault),
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}
