import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from './Order';
import { Product } from './Product';

@Table({ tableName: 'order_details', timestamps: false, underscored: true })
export class OrderDetail extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  declare id: string;

  @ForeignKey(() => Order)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'order_id' })
  declare orderId: string;

  @ForeignKey(() => Product)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'product_id' })
  declare productId: string;

  @Column({ type: DataType.STRING(150), allowNull: false, field: 'product_name' })
  declare productName: string;

  @Column({ type: DataType.STRING(500), allowNull: false, field: 'product_image' })
  declare productImage: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, field: 'unit_price' })
  declare unitPrice: number;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  declare quantity: number;

  @Column({ type: DataType.JSON, allowNull: true, field: 'selected_options_json' })
  declare selectedOptionsJson?: any;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false, field: 'item_subtotal' })
  declare itemSubtotal: number;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare notes?: string;

  // Associations
  @BelongsTo(() => Order)
  declare order: Order;

  @BelongsTo(() => Product)
  declare product: Product;

  declare selectedOptions?: any;

  public toJSON() {
    const values = { ...this.get() };
    let options = [];
    if (typeof values.selectedOptionsJson === 'string') {
      try {
        options = JSON.parse(values.selectedOptionsJson);
      } catch {
        options = [];
      }
    } else if (Array.isArray(values.selectedOptionsJson)) {
      options = values.selectedOptionsJson;
    } else if (this.selectedOptions) {
      options = this.selectedOptions;
    }

    return {
      id: values.id,
      orderId: values.orderId,
      productId: values.productId,
      productName: values.productName,
      productImage: values.productImage,
      unitPrice: Number(values.unitPrice) || 0,
      quantity: Number(values.quantity) || 1,
      selectedOptions: options,
      itemSubtotal: Number(values.itemSubtotal) || 0,
      notes: values.notes,
    };
  }
}
