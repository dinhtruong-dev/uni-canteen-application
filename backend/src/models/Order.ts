import { OrderDetail } from './OrderDetail';
import { PaymentMethod } from './Payment';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'WAITING_PICKUP'
  | 'DELIVERING'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export class Order {
  public id: string;
  public orderCode: string;
  public userId: string;
  public userName: string;
  public userPhone: string;
  public canteenId: string;
  public canteenName: string;
  public voucherId?: string;
  public orderDetails: OrderDetail[];
  public totalAmount: number;
  public discountAmount: number;
  public finalAmount: number;
  public status: OrderStatus;
  public orderType: OrderType;
  public tableId?: string;
  public tableNumber?: string;
  public pickupSlot?: string;
  public pickupCode?: string;
  public deliveryAddressId?: string;
  public deliveryAddressText?: string;
  public paymentMethod: PaymentMethod;
  public isPaid: boolean;
  public notes?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    orderCode: string,
    userId: string,
    userName: string,
    userPhone: string,
    canteenId: string,
    canteenName: string,
    orderDetails: OrderDetail[],
    orderType: OrderType,
    paymentMethod: PaymentMethod,
    options?: {
      voucherId?: string;
      discountAmount?: number;
      tableId?: string;
      tableNumber?: string;
      pickupSlot?: string;
      pickupCode?: string;
      deliveryAddressId?: string;
      deliveryAddressText?: string;
      status?: OrderStatus;
      isPaid?: boolean;
      notes?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ) {
    this.id = id;
    this.orderCode = orderCode;
    this.userId = userId;
    this.userName = userName;
    this.userPhone = userPhone;
    this.canteenId = canteenId;
    this.canteenName = canteenName;
    this.voucherId = options?.voucherId;
    this.orderDetails = orderDetails;
    this.orderType = orderType;
    this.paymentMethod = paymentMethod;

    this.totalAmount = orderDetails.reduce((sum, item) => sum + item.itemSubtotal, 0);
    this.discountAmount = options?.discountAmount || 0;
    this.finalAmount = Math.max(0, this.totalAmount - this.discountAmount);

    this.tableId = options?.tableId;
    this.tableNumber = options?.tableNumber;
    this.pickupSlot = options?.pickupSlot;
    this.pickupCode = options?.pickupCode || (orderType === 'TAKEAWAY' ? `PK-${orderCode.slice(-4)}` : undefined);
    this.deliveryAddressId = options?.deliveryAddressId;
    this.deliveryAddressText = options?.deliveryAddressText;
    this.status = options?.status || 'PENDING';
    this.isPaid = options?.isPaid || false;
    this.notes = options?.notes;
    this.createdAt = options?.createdAt || new Date();
    this.updatedAt = options?.updatedAt || new Date();
  }

  public updateStatus(newStatus: OrderStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
    if (newStatus === 'COMPLETED' || newStatus === 'READY' || newStatus === 'SERVED') {
      this.isPaid = true;
    }
  }

  public canCancel(): boolean {
    return this.status === 'PENDING' || this.status === 'CONFIRMED';
  }

  public cancel(): boolean {
    if (!this.canCancel()) return false;
    this.status = 'CANCELLED';
    this.updatedAt = new Date();
    return true;
  }

  public toJSON() {
    return {
      id: this.id,
      orderCode: this.orderCode,
      userId: this.userId,
      userName: this.userName,
      userPhone: this.userPhone,
      canteenId: this.canteenId,
      canteenName: this.canteenName,
      voucherId: this.voucherId,
      orderDetails: this.orderDetails.map((detail) => detail.toJSON()),
      totalAmount: this.totalAmount,
      discountAmount: this.discountAmount,
      finalAmount: this.finalAmount,
      status: this.status,
      orderType: this.orderType,
      tableId: this.tableId,
      tableNumber: this.tableNumber,
      pickupSlot: this.pickupSlot,
      pickupCode: this.pickupCode,
      deliveryAddressId: this.deliveryAddressId,
      deliveryAddressText: this.deliveryAddressText,
      paymentMethod: this.paymentMethod,
      isPaid: this.isPaid,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
