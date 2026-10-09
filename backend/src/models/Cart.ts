import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Canteen } from './Canteen';
import { CartItem } from './CartItem';

@Table({ tableName: 'carts', timestamps: true, createdAt: false, underscored: true })
export class Cart extends Model {
    @Column({ type: DataType.STRING(50), primaryKey: true })
    declare id: string;

    @ForeignKey(() => User)
    @Column({ type: DataType.STRING(50), allowNull: false, unique: true, field: 'user_id' })
    declare userId: string;

    @BelongsTo(() => User, { onDelete: 'CASCADE' })
    declare user: User;

    @ForeignKey(() => Canteen)
    @Column({ type: DataType.STRING(50), allowNull: true, field: 'canteen_id' })
    declare canteenId?: string;

    @BelongsTo(() => Canteen)
    declare canteen?: Canteen;

    @HasMany(() => CartItem)
    declare items: CartItem[];
}