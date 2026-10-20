// src/services/marketing/voucher.service.ts
import { Op, literal } from 'sequelize';
import { Voucher, UserVoucher } from '../../models';
import { redisService } from '../infrastructure/redis.service';

export class VoucherService {
    // ===========================================================================
    // PUBLIC LIST
    // ===========================================================================

    public async getVouchers(): Promise<Voucher[]> {
        return redisService.remember('vouchers:all', 300, async () => {
            try {
                const rows = await Voucher.findAll({ where: { isActive: true } });
                return rows || [];
            } catch (err: any) {
                console.error('[VoucherService.getVouchers Error]:', err.message);
                throw err;
            }
        });
    }

    // ===========================================================================
    // VALIDATE
    // ===========================================================================

    public async validateVoucher(
        code: string,
        orderAmount: number,
        userId?: string
    ) {
        try {
            const cleanCode = code.toUpperCase().trim();
            const voucher = await Voucher.findOne({
                where: { code: cleanCode, isActive: true },
            });

            if (!voucher) return { valid: false, message: 'Mã Voucher không tồn tại' };

            if (userId) {
                const owned = await UserVoucher.findOne({
                    where: { userId, voucherId: voucher.id, isUsed: false },
                });
                if (!owned) {
                    return {
                        valid: false,
                        message: 'Bạn chưa sở hữu voucher này hoặc đã dùng rồi',
                    };
                }
            }

            const now = new Date();
            const st = voucher.startDate ? new Date(voucher.startDate) : null;
            const et = voucher.endDate ? new Date(voucher.endDate) : null;

            if (st && now < st) {
                return { valid: false, message: 'Voucher chưa đến thời gian sử dụng' };
            }
            if (et && now > et) {
                return { valid: false, message: 'Voucher đã hết hạn sử dụng' };
            }

            if ((Number(voucher.usedCount) || 0) >= (Number(voucher.usageLimit) || 0)) {
                return { valid: false, message: 'Voucher đã hết số lượt sử dụng' };
            }

            const minAmt = Number(voucher.minOrderAmount) || 0;
            if (orderAmount < minAmt) {
                return {
                    valid: false,
                    message: `Đơn hàng tối thiểu ${minAmt.toLocaleString('vi-VN')}đ để áp dụng voucher này`,
                };
            }

            let discountAmount = 0;
            const discVal = Number(voucher.discountValue) || 0;
            const maxDisc = voucher.maxDiscount
                ? Number(voucher.maxDiscount)
                : undefined;

            if (
                voucher.discountType === 'PERCENTAGE' ||
                voucher.discountType === 'PERCENT'
            ) {
                discountAmount = (orderAmount * discVal) / 100;
                if (maxDisc && discountAmount > maxDisc) discountAmount = maxDisc;
            } else {
                discountAmount = discVal;
            }
            discountAmount = Math.min(discountAmount, orderAmount);

            return {
                valid: true,
                voucher:
                    typeof (voucher as any)?.toJSON === 'function'
                        ? (voucher as any).toJSON()
                        : voucher,
                discountAmount,
                finalAmount: Math.max(0, orderAmount - discountAmount),
            };
        } catch (err: any) {
            console.error('[VoucherService.validateVoucher Error]:', err.message);
            throw err;
        }
    }

    public async incrementVoucherUsage(voucherId: string): Promise<void> {
        await Voucher.update(
            { usedCount: literal('used_count + 1') as any },
            { where: { id: voucherId } }
        );
        await redisService.del('vouchers:all');
    }

    // ===========================================================================
    // USER VOUCHER
    // ===========================================================================

    public async getUserVouchers(userId: string): Promise<UserVoucher[]> {
        const rows = await UserVoucher.findAll({
            where: { userId },
            order: [['id', 'DESC']],
        });

        if (!Array.isArray(rows) || rows.length === 0) return [];

        const voucherIds = rows.map((uv) => uv.voucherId).filter(Boolean) as string[];
        const vouchers = await Voucher.findAll({ where: { id: voucherIds } });
        const voucherMap = new Map(vouchers.map((v) => [v.id, v]));

        for (const uv of rows) {
            const v = uv.voucherId ? voucherMap.get(uv.voucherId) : undefined;
            if (v) uv.voucher = v;
        }
        return rows;
    }

    public async claimVoucherForUser(
        userId: string,
        voucherIdOrCode: string
    ): Promise<{ success: boolean; message: string; userVoucher?: UserVoucher }> {
        try {
            const cleanCode = voucherIdOrCode.toUpperCase().trim();

            const voucher = await Voucher.findOne({
                where: {
                    [Op.or]: [
                        { id: voucherIdOrCode, isActive: true },
                        { code: cleanCode, isActive: true },
                    ],
                },
            });

            if (!voucher) {
                return {
                    success: false,
                    message: 'Voucher không tồn tại hoặc đã bị xóa',
                };
            }

            const existing = await UserVoucher.findOne({
                where: { userId, voucherId: voucher.id },
            });

            if (existing) {
                if (existing.isUsed) {
                    return {
                        success: false,
                        message: 'Bạn đã sử dụng voucher này trước đó',
                    };
                }
                return {
                    success: false,
                    message: 'Voucher này đã có trong kho ví của bạn',
                };
            }

            const userVoucher = await UserVoucher.create({
                id: `uv-${Date.now()}`,
                userId,
                voucherId: voucher.id,
                isUsed: false,
            });

            userVoucher.voucher = voucher;

            return {
                success: true,
                message: `Đã lưu voucher ${voucher.code} vào ví của bạn thành công!`,
                userVoucher,
            };
        } catch (err: any) {
            console.error('[VoucherService.claimVoucherForUser Error]:', err.message);
            throw err;
        }
    }

    public async createVoucher(data: any): Promise<Voucher> {
        const id = data.id || `vouch-${Date.now()}`;
        const voucher = await Voucher.create({
            id,
            code: (data.code || `KM${Date.now()}`).toUpperCase().trim(),
            title: data.title || 'Mã giảm giá',
            description: data.description,
            discountType: data.discountType || 'PERCENTAGE',
            discountValue: Number(data.discountValue) || 10,
            minOrderAmount: Number(data.minOrderAmount) || 0,
            maxDiscount: Number(data.maxDiscount) || 50000,
            usageLimit: Number(data.usageLimit) || 100,
            usedCount: 0,
            isActive: true,
            startDate: data.startDate || new Date(),
            endDate: data.endDate || new Date(Date.now() + 30 * 86400000),
        });
        await redisService.del('vouchers:all');
        return voucher;
    }

    public async updateVoucher(id: string, data: any): Promise<Voucher | null> {
        const voucher = await Voucher.findByPk(id);
        if (!voucher) return null;
        await voucher.update(data);
        await redisService.del('vouchers:all');
        return voucher;
    }

    public async deleteVoucher(id: string): Promise<boolean> {
        const affected = await Voucher.destroy({ where: { id } });
        await redisService.del('vouchers:all');
        return affected > 0;
    }
}

export const voucherService = new VoucherService();