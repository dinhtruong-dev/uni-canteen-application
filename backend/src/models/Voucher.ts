export type VoucherDiscountType = 'PERCENTAGE' | 'FIXED';

export class Voucher {
  public id: string;
  public code: string;
  public title: string;
  public description: string;
  public discountType: VoucherDiscountType;
  public discountValue: number; // 20 for 20% or 15000 for 15.000đ
  public minOrderAmount: number;
  public maxDiscount?: number;
  public startDate: Date;
  public endDate: Date;
  public usageLimit: number;
  public usedCount: number;
  public isActive: boolean;

  constructor(
    id: string,
    code: string,
    title: string,
    description: string,
    discountType: VoucherDiscountType,
    discountValue: number,
    minOrderAmount: number = 0,
    options?: {
      maxDiscount?: number;
      startDate?: Date;
      endDate?: Date;
      usageLimit?: number;
      usedCount?: number;
      isActive?: boolean;
    }
  ) {
    this.id = id;
    this.code = code.toUpperCase().trim();
    this.title = title;
    this.description = description;
    this.discountType = discountType;
    this.discountValue = discountValue;
    this.minOrderAmount = minOrderAmount;
    this.maxDiscount = options?.maxDiscount;
    this.startDate = options?.startDate || new Date(Date.now() - 7 * 24 * 3600 * 1000);
    this.endDate = options?.endDate || new Date(Date.now() + 30 * 24 * 3600 * 1000);
    this.usageLimit = options?.usageLimit || 1000;
    this.usedCount = options?.usedCount || 0;
    this.isActive = options?.isActive !== undefined ? options.isActive : true;
  }

  public isValid(currentAmount: number): { valid: boolean; reason?: string } {
    if (!this.isActive) {
      return { valid: false, reason: 'Voucher hiện không khả dụng' };
    }
    const now = new Date();
    if (now < this.startDate || now > this.endDate) {
      return { valid: false, reason: 'Voucher đã hết hạn sử dụng' };
    }
    if (this.usedCount >= this.usageLimit) {
      return { valid: false, reason: 'Voucher đã hết số lượt sử dụng' };
    }
    if (currentAmount < this.minOrderAmount) {
      return {
        valid: false,
        reason: `Đơn hàng tối thiểu ${this.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng voucher này`,
      };
    }
    return { valid: true };
  }

  public calculateDiscount(orderAmount: number): number {
    const validity = this.isValid(orderAmount);
    if (!validity.valid) return 0;

    let discount = 0;
    if (this.discountType === 'PERCENTAGE') {
      discount = (orderAmount * this.discountValue) / 100;
      if (this.maxDiscount && discount > this.maxDiscount) {
        discount = this.maxDiscount;
      }
    } else {
      discount = this.discountValue;
    }

    return Math.min(discount, orderAmount);
  }

  public claim(): boolean {
    if (this.usedCount >= this.usageLimit) return false;
    this.usedCount += 1;
    return true;
  }

  public toJSON() {
    return {
      id: this.id,
      code: this.code,
      title: this.title,
      description: this.description,
      discountType: this.discountType,
      discountValue: this.discountValue,
      minOrderAmount: this.minOrderAmount,
      maxDiscount: this.maxDiscount,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      usageLimit: this.usageLimit,
      usedCount: this.usedCount,
      isActive: this.isActive,
    };
  }
}
