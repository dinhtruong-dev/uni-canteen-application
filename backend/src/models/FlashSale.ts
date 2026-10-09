import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './Product';
import { Canteen } from './Canteen';

@Table({ tableName: 'flash_sales', timestamps: false, underscored: true })
export class FlashSale extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare description?: string;

  @ForeignKey(() => Product)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'product_id' })
  declare productId: string;

  @ForeignKey(() => Canteen)
  @Column({ type: DataType.STRING(50), allowNull: true, field: 'canteen_id' })
  declare canteenId?: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, field: 'original_price' })
  declare originalPrice: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, field: 'sale_price' })
  declare salePrice: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'discount_percent' })
  declare discountPercent: number;

  @Column({ type: DataType.INTEGER, defaultValue: 100, field: 'total_slots' })
  declare totalSlots: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'sold_slots' })
  declare soldSlots: number;

  @Column({ type: DataType.DATE, allowNull: false, field: 'start_time' })
  declare startTime: Date;

  @Column({ type: DataType.DATE, allowNull: false, field: 'end_time' })
  declare endTime: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: true, field: 'is_active' })
  declare isActive: boolean;

  // Associations
  @BelongsTo(() => Product)
  declare product: Product;

  @BelongsTo(() => Canteen)
  declare canteen?: Canteen;

  declare productName?: string;
  declare productImage?: string;

  public toJSON() {
    const values = { ...this.get() };
    const now = new Date();
    const st = values.startTime ? new Date(values.startTime) : now;
    const et = values.endTime ? new Date(values.endTime) : now;
    const total = Number(values.totalSlots) || 0;
    const sold = Number(values.soldSlots) || 0;
    const remainingSlots = Math.max(0, total - sold);
    const isOngoing = Boolean(values.isActive) && now >= st && now <= et && sold < total;

    return {
      id: values.id,
      title: values.title,
      description: values.description,
      productId: values.productId,
      canteenId: values.canteenId,
      productName: this.productName || values.productName,
      productImage: this.productImage || values.productImage,
      originalPrice: Number(values.originalPrice) || 0,
      salePrice: Number(values.salePrice) || 0,
      discountPercent: Number(values.discountPercent) || 0,
      totalSlots: total,
      soldSlots: sold,
      remainingSlots,
      startTime: values.startTime ? new Date(values.startTime).toISOString() : new Date().toISOString(),
      endTime: values.endTime ? new Date(values.endTime).toISOString() : new Date().toISOString(),
      isOngoing,
      isActive: Boolean(values.isActive),
    };
  }
}
