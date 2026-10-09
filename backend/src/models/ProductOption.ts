// src/models/ProductOption.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Product } from './Product';
import { OptionItem } from './OptionItem';

export type OptionType =
  | 'SIZE'
  | 'TOPPING'
  | 'SUGAR_LEVEL'
  | 'ICE_LEVEL'
  | 'CUSTOM';

@Table({ tableName: 'product_options', timestamps: false, underscored: true })
export class ProductOption extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @ForeignKey(() => Product)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'product_id' })
  declare productId: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({
    type: DataType.ENUM('SIZE', 'TOPPING', 'SUGAR_LEVEL', 'ICE_LEVEL', 'CUSTOM'),
    defaultValue: 'CUSTOM',
  })
  declare type: OptionType;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'is_required' })
  declare isRequired: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: 1, field: 'max_select' })
  declare maxSelect: number;

  // Associations
  @BelongsTo(() => Product, { onDelete: 'CASCADE' })
  declare product: Product;

  public items?: any[];
}