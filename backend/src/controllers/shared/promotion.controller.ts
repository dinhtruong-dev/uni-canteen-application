import { Request, Response } from 'express';
import { bannerService, flashSaleService, voucherService } from '../../services';

export class PromotionController {
  public async getBanners(_req: Request, res: Response) {
    try {
      const banners = (await bannerService.getBanners()).map((b: any) =>
        typeof b?.toJSON === 'function' ? b.toJSON() : b
      );
      return res.json({ success: true, data: banners });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tải banners', error: err.message });
    }
  }

  public async getFlashSales(_req: Request, res: Response) {
    try {
      const flashSales = (await flashSaleService.getFlashSales()).map((fs: any) =>
        typeof fs?.toJSON === 'function' ? fs.toJSON() : fs
      );
      return res.json({ success: true, data: flashSales });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tải flash sales', error: err.message });
    }
  }

  public async claimFlashSale(req: Request, res: Response) {
    try {
      const ok = await flashSaleService.claimFlashSaleSlot(req.params.id);
      if (!ok) {
        return res.status(400).json({ success: false, message: 'Flash sale đã hết lượt hoặc đã kết thúc' });
      }
      return res.json({ success: true, message: 'Đã nhận suất flash sale' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi nhận flash sale', error: err.message });
    }
  }

  public async getVouchers(_req: Request, res: Response) {
    try {
      const vouchers = (await voucherService.getVouchers()).map((v: any) =>
        typeof v?.toJSON === 'function' ? v.toJSON() : v
      );
      return res.json({ success: true, data: vouchers });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tải vouchers', error: err.message });
    }
  }

  public async validateVoucher(req: Request, res: Response) {
    try {
      const { code, orderAmount } = req.body;
      const result = await voucherService.validateVoucher(code, Number(orderAmount) || 0);
      if (!result.valid) {
        return res.status(400).json({ success: false, message: result.message });
      }
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi kiểm tra voucher', error: err.message });
    }
  }

  public async getUserVouchers(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || (req.query.userId as string) || 'user-stu-1';
      const userVouchers = await voucherService.getUserVouchers(userId);
      return res.json({
        success: true,
        data: userVouchers.map((uv: any) =>
          typeof uv?.toJSON === 'function' ? uv.toJSON() : uv
        ),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tải kho voucher', error: err.message });
    }
  }

  public async claimVoucher(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || req.body?.userId || 'user-stu-1';
      const voucherIdOrCode = req.body?.voucherId || req.body?.voucherCode || req.params?.id;
      if (!voucherIdOrCode) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin mã voucher cần lưu' });
      }
      const result = await voucherService.claimVoucherForUser(userId, voucherIdOrCode);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.json({
        success: true,
        message: result.message,
        data:
          typeof (result.userVoucher as any)?.toJSON === 'function'
            ? (result.userVoucher as any).toJSON()
            : result.userVoucher,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi lưu voucher vào ví', error: err.message });
    }
  }

  public async getPromotions(req: Request, res: Response) {
    return this.getVouchers(req, res);
  }

  public async createPromotion(req: Request, res: Response) {
    try {
      const voucher = await voucherService.createVoucher(req.body);
      return res.status(201).json({
        success: true,
        message: `Đã tạo mã khuyến mãi "${voucher.code}"`,
        data: typeof (voucher as any)?.toJSON === 'function' ? (voucher as any).toJSON() : voucher,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi tạo mã khuyến mãi', error: err.message });
    }
  }

  public async updatePromotion(req: Request, res: Response) {
    try {
      const voucher = await voucherService.updateVoucher(req.params.id, req.body);
      if (!voucher) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
      }
      return res.json({ success: true, message: 'Đã cập nhật mã khuyến mãi thành công', data: voucher });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật mã khuyến mãi', error: err.message });
    }
  }

  public async deletePromotion(req: Request, res: Response) {
    try {
      const ok = await voucherService.deleteVoucher(req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
      }
      return res.json({ success: true, message: 'Đã xóa mã khuyến mãi thành công' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Lỗi xóa mã khuyến mãi', error: err.message });
    }
  }
}

export const promotionController = new PromotionController();
