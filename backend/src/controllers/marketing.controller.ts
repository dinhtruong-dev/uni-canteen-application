import { Request, Response } from 'express';
import { marketingService } from '../services/marketing.service';

export class MarketingController {
  public getBanners(_req: Request, res: Response) {
    const banners = marketingService.getBanners().map((b) => b.toJSON());
    res.json({ success: true, data: banners });
  }

  public getFlashSales(_req: Request, res: Response) {
    const flashSales = marketingService.getFlashSales().map((fs) => fs.toJSON());
    res.json({ success: true, data: flashSales });
  }

  public claimFlashSale(req: Request, res: Response) {
    const ok = marketingService.claimFlashSaleSlot(req.params.id);
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Flash sale đã hết lượt hoặc đã kết thúc' });
    }
    res.json({ success: true, message: 'Đã nhận suất flash sale' });
  }

  public getVouchers(_req: Request, res: Response) {
    const vouchers = marketingService.getVouchers().map((v) => v.toJSON());
    res.json({ success: true, data: vouchers });
  }

  public validateVoucher(req: Request, res: Response) {
    const { code, orderAmount } = req.body;
    const result = marketingService.validateVoucher(code, Number(orderAmount) || 0);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }
    res.json({ success: true, data: result });
  }
}

export const marketingController = new MarketingController();
