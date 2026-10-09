import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { OptionItem } from './OptionItem';
import { Canteen } from './Canteen';

@Table({ tableName: 'option_groups', timestamps: true, updatedAt: false, underscored: true })
export class OptionGroup extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @ForeignKey(() => Canteen)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'canteen_id' })
  declare canteenId: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, field: 'is_required' })
  declare isRequired: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'min_choices' })
  declare minChoices: number;

  @Column({ type: DataType.INTEGER, defaultValue: 1, field: 'max_choices' })
  declare maxChoices: number;

  @BelongsTo(() => Canteen)
  declare canteen: Canteen;

  @HasMany(() => OptionItem)
  declare items: OptionItem[];
}