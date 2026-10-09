import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Category } from './Category';
import { Canteen } from './Canteen';
import { OrderDetail } from './OrderDetail';
import { FlashSale } from './FlashSale';
import { Favorite } from './Favorite';
import { ProductOption } from './ProductOption';

@Table({ tableName: 'products', timestamps: true, updatedAt: false, underscored: true })
export class Product extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare name: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare price: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true, field: 'original_price' })
  declare originalPrice?: number;

  @ForeignKey(() => Category)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'category_id' })
  declare categoryId: string;

  @Column({ type: DataType.STRING(100), defaultValue: '', field: 'category_name' })
  declare categoryName?: string;

  @ForeignKey(() => Canteen)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'canteen_id' })
  declare canteenId: string;

  @Column({ type: DataType.STRING(100), defaultValue: '', field: 'canteen_name' })
  declare canteenName?: string;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare image: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description?: string;

  @Column({ type: DataType.DECIMAL(2, 1), defaultValue: 5.0 })
  declare rating: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'review_count' })
  declare reviewCount: number;

  @Column({ type: DataType.INTEGER, defaultValue: 10, field: 'preparation_time' })
  declare preparationTime: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true, field: 'is_available' })
  declare isAvailable: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'is_bestseller' })
  declare isBestSeller?: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'is_new' })
  declare isNew?: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'is_vegetarian' })
  declare isVegetarian?: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'sold_count' })
  declare soldCount: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare calories?: number;

  // Associations
  @BelongsTo(() => Category)
  declare category: Category;

  @BelongsTo(() => Canteen)
  declare canteen: Canteen;

  @HasMany(() => OrderDetail)
  declare orderDetails: OrderDetail[];

  @HasMany(() => FlashSale)
  declare flashSales: FlashSale[];

  @HasMany(() => Favorite)
  declare favorites: Favorite[];

  @HasMany(() => ProductOption)
  declare options: ProductOption[];

  public toJSON() {
    const values = { ...this.get() };
    const orig = Number(values.originalPrice) || 0;
    const pr = Number(values.price) || 0;
    const discountPercent = orig > pr && orig > 0 ? Math.round(((orig - pr) / orig) * 100) : 0;

    return {
      id: values.id,
      name: values.name,
      price: pr,
      originalPrice: values.originalPrice ? Number(values.originalPrice) : undefined,
      discountPercent,
      categoryId: values.categoryId,
      categoryName: this.categoryName || values.categoryName,
      canteenId: values.canteenId,
      canteenName: this.canteenName || values.canteenName,
      image: values.image,
      description: values.description,
      rating: Number(values.rating) || 5.0,
      reviewCount: Number(values.reviewCount) || 0,
      preparationTime: Number(values.preparationTime) || 10,
      isAvailable: Boolean(values.isAvailable),
      isBestSeller: Boolean(values.isBestSeller),
      isNew: Boolean(values.isNew),
      isVegetarian: Boolean(values.isVegetarian),
      soldCount: Number(values.soldCount) || 0,
      calories: values.calories ? Number(values.calories) : undefined,
      options: (this.options || values.options || []).map((o: any) => (typeof o?.toJSON === 'function' ? o.toJSON() : o)),
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}
