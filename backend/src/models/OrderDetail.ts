import { SelectedOptionSnapshot } from './Cart';

export class OrderDetail {
  public id: string;
  public orderId: string;
  public productId: string;
  public productName: string;
  public productImage: string;
  public unitPrice: number;
  public quantity: number;
  public selectedOptions: SelectedOptionSnapshot[];
  public itemSubtotal: number;
  public notes?: string;

  constructor(
    id: string,
    orderId: string,
    productId: string,
    productName: string,
    productImage: string,
    unitPrice: number,
    quantity: number = 1,
    selectedOptions: SelectedOptionSnapshot[] = [],
    notes?: string
  ) {
    this.id = id;
    this.orderId = orderId;
    this.productId = productId;
    this.productName = productName;
    this.productImage = productImage;
    this.unitPrice = unitPrice;
    this.quantity = Math.max(1, quantity);
    this.selectedOptions = selectedOptions;
    this.notes = notes;
    this.itemSubtotal = this.unitPrice * this.quantity;
  }

  public toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      productId: this.productId,
      productName: this.productName,
      productImage: this.productImage,
      unitPrice: this.unitPrice,
      quantity: this.quantity,
      selectedOptions: this.selectedOptions,
      itemSubtotal: this.itemSubtotal,
      notes: this.notes,
    };
  }
}
