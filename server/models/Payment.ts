export type PaymentMethod = 'CAMPUS_WALLET' | 'MOMO' | 'ZALOPAY' | 'VNPAY' | 'BANK_TRANSFER' | 'CASH';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export class Payment {
  public id: string;
  public orderId: string;
  public userId: string;
  public amount: number;
  public method: PaymentMethod;
  public status: PaymentStatus;
  public transactionCode: string;
  public gatewayResponse?: Record<string, any>;
  public paidAt?: Date;
  public createdAt: Date;

  constructor(
    id: string,
    orderId: string,
    userId: string,
    amount: number,
    method: PaymentMethod,
    status: PaymentStatus = 'PENDING',
    transactionCode?: string,
    options?: {
      gatewayResponse?: Record<string, any>;
      paidAt?: Date;
      createdAt?: Date;
    }
  ) {
    this.id = id;
    this.orderId = orderId;
    this.userId = userId;
    this.amount = amount;
    this.method = method;
    this.status = status;
    this.transactionCode = transactionCode || `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    this.gatewayResponse = options?.gatewayResponse;
    this.paidAt = options?.paidAt || (status === 'SUCCESS' ? new Date() : undefined);
    this.createdAt = options?.createdAt || new Date();
  }

  public markSuccess(transactionCode?: string): void {
    this.status = 'SUCCESS';
    this.paidAt = new Date();
    if (transactionCode) this.transactionCode = transactionCode;
  }

  public markFailed(reason?: string): void {
    this.status = 'FAILED';
    if (reason) {
      this.gatewayResponse = { ...this.gatewayResponse, failureReason: reason };
    }
  }

  public toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      userId: this.userId,
      amount: this.amount,
      method: this.method,
      status: this.status,
      transactionCode: this.transactionCode,
      gatewayResponse: this.gatewayResponse,
      paidAt: this.paidAt ? this.paidAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
