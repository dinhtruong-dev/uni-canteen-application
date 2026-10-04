import { Request, Response } from 'express';
import { marketingService } from '../services/marketing.service';

export class MarketingController {
  public async getBanners(_req: Request, res: Response) {
    try {
      const banners = (await marketingService.getBanners()).map((b: any) =>
        typeof b?.toJSON === 'function' ? b.toJSON() : b
      );
      res.json({ success: true, data: banners });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải banners', error: err.message });
    }
  }

  public async getFlashSales(_req: Request, res: Response) {
    try {
      const flashSales = (await marketingService.getFlashSales()).map((fs: any) =>
        typeof fs?.toJSON === 'function' ? fs.toJSON() : fs
      );
      res.json({ success: true, data: flashSales });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải flash sales', error: err.message });
    }
  }

  public async claimFlashSale(req: Request, res: Response) {
    try {
      const ok = await marketingService.claimFlashSaleSlot(req.params.id);
      if (!ok) {
        return res.status(400).json({ success: false, message: 'Flash sale đã hết lượt hoặc đã kết thúc' });
      }
      res.json({ success: true, message: 'Đã nhận suất flash sale' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi nhận flash sale', error: err.message });
    }
  }

  public async getVouchers(_req: Request, res: Response) {
    try {
      const vouchers = (await marketingService.getVouchers()).map((v: any) =>
        typeof v?.toJSON === 'function' ? v.toJSON() : v
      );
      res.json({ success: true, data: vouchers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải vouchers', error: err.message });
    }
  }

  public async validateVoucher(req: Request, res: Response) {
    try {
      const { code, orderAmount } = req.body;
      const result = await marketingService.validateVoucher(code, Number(orderAmount) || 0);
      if (!result.valid) {
        return res.status(400).json({ success: false, message: result.message });
      }
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi kiểm tra voucher', error: err.message });
    }
  }

  public async getUserVouchers(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || (req.query.userId as string) || 'user-stu-1';
      const userVouchers = await marketingService.getUserVouchers(userId);
      res.json({
        success: true,
        data: userVouchers.map((uv: any) =>
          typeof uv?.toJSON === 'function' ? uv.toJSON() : uv
        ),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi tải kho voucher', error: err.message });
    }
  }

  public async claimVoucher(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || req.body?.userId || 'user-stu-1';
      const voucherIdOrCode = req.body?.voucherId || req.body?.voucherCode || req.params?.id;
      if (!voucherIdOrCode) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin mã voucher cần lưu' });
      }
      const result = await marketingService.claimVoucherForUser(userId, voucherIdOrCode);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json({
        success: true,
        message: result.message,
        data:
          typeof (result.userVoucher as any)?.toJSON === 'function'
            ? (result.userVoucher as any).toJSON()
            : result.userVoucher,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Lỗi lưu voucher vào ví', error: err.message });
    }
  }
}

export const marketingController = new MarketingController();
