import { db } from './database.service';
import { Banner, FlashSale, Voucher } from '../models';

export class MarketingService {
  // Banners
  public getBanners(): Banner[] {
    return Array.from(db.banners.values())
      .filter((b) => b.isCurrentlyActive())
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  // Flash Sales
  public getFlashSales(): FlashSale[] {
    return Array.from(db.flashSales.values()).filter((fs) => fs.isOngoing());
  }

  public claimFlashSaleSlot(flashSaleId: string): boolean {
    const fs = db.flashSales.get(flashSaleId);
    if (!fs) return false;
    return fs.claimSlot();
  }

  // Vouchers
  public getVouchers(): Voucher[] {
    return Array.from(db.vouchers.values()).filter((v) => v.isActive);
  }

  public validateVoucher(code: string, orderAmount: number) {
    const voucher = Array.from(db.vouchers.values()).find(
      (v) => v.code === code.toUpperCase().trim()
    );

    if (!voucher) {
      return { valid: false, message: 'Mã Voucher không tồn tại' };
    }

    const check = voucher.isValid(orderAmount);
    if (!check.valid) {
      return { valid: false, message: check.reason };
    }

    const discountAmount = voucher.calculateDiscount(orderAmount);
    return {
      valid: true,
      voucher: voucher.toJSON(),
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    };
  }
}

export const marketingService = new MarketingService();
