import { Request, Response } from 'express';
import { staffService } from '../../services/staff.service';
import { marketingService } from '../../services/marketing.service';

export class PromotionController {
    public async getPromotions(_req: Request, res: Response) {
        try {
            const vouchers = await marketingService.getVouchers();
            return res.json({ success: true, total: vouchers.length, data: vouchers });
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi tải mã khuyến mãi',
                error: err.message,
            });
        }
    }

    public async createPromotion(req: Request, res: Response) {
        try {
            const {
                code,
                title,
                description,
                discountType,
                discountValue,
                minOrderAmount,
                maxDiscount,
                usageLimit,
            } = req.body;

            if (!code || !title || discountValue === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập đầy đủ Mã code, Tiêu đề và Giá trị giảm',
                });
            }

            const voucher = await staffService.createPromotion({
                code,
                title,
                description,
                discountType,
                discountValue,
                minOrderAmount,
                maxDiscount,
                usageLimit,
            });

            return res.status(201).json({
                success: true,
                message: `Đã tạo mã khuyến mãi "${voucher.code}"`,
                data:
                    typeof (voucher as any)?.toJSON === 'function'
                        ? (voucher as any).toJSON()
                        : voucher,
            });
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message || 'Lỗi tạo mã khuyến mãi',
            });
        }
    }

    public async updatePromotion(req: Request, res: Response) {
        try {
            await staffService.updatePromotion(req.params.id, req.body);
            return res.json({
                success: true,
                message: 'Đã cập nhật mã khuyến mãi thành công',
            });
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi cập nhật mã khuyến mãi',
                error: err.message,
            });
        }
    }

    public async deletePromotion(req: Request, res: Response) {
        try {
            await staffService.deletePromotion(req.params.id);
            return res.json({
                success: true,
                message: 'Đã xóa mã khuyến mãi thành công',
            });
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi xóa mã khuyến mãi',
                error: err.message,
            });
        }
    }
}

export const promotionController = new PromotionController();