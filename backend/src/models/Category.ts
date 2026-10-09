import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Product } from './Product';

@Table({ tableName: 'categories', timestamps: false, underscored: true })
export class Category extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare icon: string;

  @Column({ type: DataType.STRING(100), defaultValue: '' })
  declare slug: string;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare image: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description?: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'display_order' })
  declare displayOrder: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true, field: 'is_active' })
  declare isActive: boolean;

  // Associations
  @HasMany(() => Product)
  declare products: Product[];


  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      name: values.name,
      icon: values.icon,
      slug: values.slug,
      image: values.image,
      description: values.description,
      displayOrder: Number(values.displayOrder) || 0,
      isActive: Boolean(values.isActive),
    };
  }
}
