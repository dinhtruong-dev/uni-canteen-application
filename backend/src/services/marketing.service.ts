// src/services/marketing.service.ts
import { bannerService } from './marketing/banner.service';
import { flashSaleService } from './marketing/flashSale.service';
import { voucherService } from './marketing/voucher.service';

export class MarketingService {
  public getBanners = bannerService.getBanners.bind(bannerService);

  public getFlashSales = flashSaleService.getFlashSales.bind(flashSaleService);
  public claimFlashSaleSlot =
    flashSaleService.claimFlashSaleSlot.bind(flashSaleService);

  public getVouchers = voucherService.getVouchers.bind(voucherService);
  public validateVoucher = voucherService.validateVoucher.bind(voucherService);
  public incrementVoucherUsage =
    voucherService.incrementVoucherUsage.bind(voucherService);

  public getUserVouchers = voucherService.getUserVouchers.bind(voucherService);
  public claimVoucherForUser =
    voucherService.claimVoucherForUser.bind(voucherService);
}

export const marketingService = new MarketingService();