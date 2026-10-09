import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from './Order';
import { Product } from './Product';

@Table({ tableName: 'order_details', timestamps: false, underscored: true })
export class OrderDetail extends Model {
  @Column({ type: DataType.STRING(50), primaryKey: true })
  public id!: string;

  @ForeignKey(() => Order)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'order_id' })
  public orderId!: string;

  @ForeignKey(() => Product)
  @Column({ type: DataType.STRING(50), allowNull: false, field: 'product_id' })
  public productId!: string;

  @Column({ type: DataType.STRING(150), allowNull: false, field: 'product_name' })
  public productName!: string;

  @Column({ type: DataType.STRING(500), allowNull: false, field: 'product_image' })
  public productImage!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, field: 'unit_price' })
  public unitPrice!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  public quantity!: number;

  @Column({ type: DataType.JSON, allowNull: true, field: 'selected_options_json' })
  public selectedOptionsJson?: any;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false, field: 'item_subtotal' })
  public itemSubtotal!: number;

  @Column({ type: DataType.STRING(255), allowNull: true })
  public notes?: string;

  // Associations
  @BelongsTo(() => Order)
  public order!: Order;

  @BelongsTo(() => Product)
  public product!: Product;

  public selectedOptions?: any;

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
