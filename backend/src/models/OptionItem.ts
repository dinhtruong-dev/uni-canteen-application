import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { OptionGroup } from './OptionGroup';

@Table({ tableName: 'option_items', timestamps: true, updatedAt: false, underscored: true })
export class OptionItem extends Model {
    @Column({ type: DataType.STRING(50), primaryKey: true })
    declare id: string;

    @ForeignKey(() => OptionGroup)
    @Column({ type: DataType.STRING(50), allowNull: false, field: 'group_id' })
    declare groupId: string;

    @BelongsTo(() => OptionGroup, { onDelete: 'CASCADE' })
    declare group: OptionGroup;

    @Column({ type: DataType.STRING(100), allowNull: false })
    declare name: string;

    @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
    declare price: number;

    @Column({ type: DataType.BOOLEAN, defaultValue: true, field: 'is_available' })
    declare isAvailable: boolean;

    public toJSON() {
        const values = { ...this.get() };
        return {
            id: values.id,
            groupId: values.groupId,
            name: values.name,
            price: Number(values.price) || 0,
            isAvailable: Boolean(values.isAvailable),
            createdAt: values.createdAt ? new Date(values.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: values.updatedAt ? new Date(values.updatedAt).toISOString() : new Date().toISOString(),
        };
    }
}
