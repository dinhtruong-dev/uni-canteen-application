import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Cart } from './Cart';
import { Product } from './Product';

@Table({ tableName: 'cart_items', timestamps: true, updatedAt: false, underscored: true })
export class CartItem extends Model {
    @Column({ type: DataType.STRING(50), primaryKey: true })
    declare id: string;

    @ForeignKey(() => Cart)
    @Column({ type: DataType.STRING(50), allowNull: false, field: 'cart_id' })
    declare cartId: string;

    @BelongsTo(() => Cart, { onDelete: 'CASCADE' })
    declare cart: Cart;

    @ForeignKey(() => Product)
    @Column({ type: DataType.STRING(50), allowNull: false, field: 'product_id' })
    declare productId: string;

    @BelongsTo(() => Product, { onDelete: 'CASCADE' })
    declare product: Product;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
    declare quantity: number;

    @Column({ type: DataType.JSON, allowNull: true, field: 'selected_options_json' })
    declare selectedOptions: any;

    @Column({ type: DataType.STRING(150), allowNull: true })
    declare productName?: string;

    @Column({ type: DataType.STRING(255), allowNull: true })
    declare productImage?: string;

    @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
    declare basePrice?: number;

    @Column({ type: DataType.STRING(255), allowNull: true })
    declare notes?: string;
}