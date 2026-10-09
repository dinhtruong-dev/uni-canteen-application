import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Canteen } from './Canteen';

@Table({ tableName: 'banners', timestamps: false, underscored: true })
export class Banner extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare title: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare subtitle?: string;

  @Column({ type: DataType.STRING(500), allowNull: false, field: 'image_url' })
  declare imageUrl: string;

  @Column({ type: DataType.STRING(500), allowNull: true, field: 'link_url' })
  declare linkUrl?: string;

  @Column({ type: DataType.STRING(50), allowNull: true, field: 'target_type' })
  declare targetType?: 'PRODUCT' | 'CATEGORY' | 'EXTERNAL';

  @Column({ type: DataType.STRING(50), allowNull: true, field: 'target_id' })
  declare targetId?: string;

  @ForeignKey(() => Canteen)
  @Column({ type: DataType.STRING(50), allowNull: true, field: 'canteen_id' })
  declare canteenId?: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0, field: 'display_order' })
  declare displayOrder: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true, field: 'is_active' })
  declare isActive: boolean;

  @Column({ type: DataType.DATE, allowNull: true, field: 'start_date' })
  declare startDate?: Date;

  @Column({ type: DataType.DATE, allowNull: true, field: 'end_date' })
  declare endDate?: Date;

  // Associations
  @BelongsTo(() => Canteen)
  declare canteen?: Canteen;

  public toJSON() {
    const values = { ...this.get() };
    const now = new Date();
    const isCurrentlyActive =
      Boolean(values.isActive) &&
      (!values.startDate || now >= new Date(values.startDate)) &&
      (!values.endDate || now <= new Date(values.endDate));

    return {
      id: values.id,
      title: values.title,
      subtitle: values.subtitle,
      imageUrl: values.imageUrl,
      linkUrl: values.linkUrl,
      targetType: values.targetType,
      targetId: values.targetId,
      canteenId: values.canteenId,
      displayOrder: Number(values.displayOrder) || 1,
      isActive: Boolean(values.isActive),
      isCurrentlyActive,
      startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
      endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
    };
  }
}
