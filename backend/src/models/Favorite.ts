import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Product } from './Product';

export type FavoriteTargetType = 'PRODUCT' | 'ORDER';

@Table({ tableName: 'favorites', timestamps: true, updatedAt: false, underscored: true })
export class Favorite extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'user_id' })
  declare userId: string;

  @Column({
    type: DataType.ENUM('PRODUCT', 'ORDER'),
    defaultValue: 'PRODUCT',
    field: 'target_type',
  })
  declare targetType: FavoriteTargetType;

  @ForeignKey(() => Product)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'target_id' })
  declare targetId: string;

  // Associations
  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Product)
  declare product?: Product;

  public toJSON() {
    const values = { ...this.get() };
    return {
      id: values.id,
      userId: values.userId,
      targetType: values.targetType,
      targetId: values.targetId,
      createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}
