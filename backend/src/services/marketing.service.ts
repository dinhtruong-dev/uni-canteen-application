import { db } from './database.service';
import { Banner, FlashSale, Voucher, UserVoucher } from '../models';
import { executeQuery } from '../config/db.config';
import { redisService } from './redis.service';

export class MarketingService {
  /**
   * Lấy danh sách banner quảng cáo
   * Cache-Aside: Redis -> Miss -> MySQL -> Cache
   */
  public async getBanners(): Promise<Banner[]> {
    return redisService.remember('banners:all', 300, async () => {
      try {
        const rows = await executeQuery('SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC');
        if (Array.isArray(rows) && rows.length > 0) {
          const list: Banner[] = [];
          for (const r of rows) {
            const b = new Banner(
              r.id,
              r.title,
              r.image,
              Number(r.display_order) || 0,
              r.is_active === 1 || r.is_active === true,
              {
                linkUrl: r.link || '#',
                startDate: r.start_date ? new Date(r.start_date) : undefined,
                endDate: r.end_date ? new Date(r.end_date) : undefined,
              }
            );
            db.banners.set(b.id, b);
            list.push(b);
          }
          return list;
        }
      } catch (err: any) {
        console.warn('[MarketingService] MySQL banners fetch notice:', err.message);
      }
      return Array.from(db.banners.values())
        .filter((b) => b.isCurrentlyActive())
        .sort((a, b) => a.displayOrder - b.displayOrder);
    });
  }

  /**
   * Lấy danh sách Flash Sale
   * Cache-Aside: Redis -> Miss -> MySQL -> Cache
   */
  public async getFlashSales(): Promise<FlashSale[]> {
    return redisService.remember('flash_sales:all', 120, async () => {
      try {
        const rows = await executeQuery('SELECT * FROM flash_sales WHERE start_time <= NOW() AND end_time >= NOW()');
        if (Array.isArray(rows) && rows.length > 0) {
          const list: FlashSale[] = [];
          for (const r of rows) {
            const prod = db.products.get(r.product_id);
            const fs = new FlashSale(
              r.id,
              r.title || 'Flash Sale Giờ Vàng',
              r.product_id,
              prod?.name || 'Món Flash Sale',
              prod?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
              Number(r.original_price) || 40000,
              Number(r.sale_price) || 25000,
              Number(r.total_slots) || 50,
              Number(r.sold_slots) || 0,
              new Date(r.start_time),
              new Date(r.end_time),
              true
            );
            db.flashSales.set(fs.id, fs);
            list.push(fs);
          }
          return list;
        }
      } catch (err: any) {
        console.warn('[MarketingService] MySQL flash sales notice:', err.message);
      }
      return Array.from(db.flashSales.values()).filter((fs) => fs.isOngoing());
    });
  }

  public async claimFlashSaleSlot(flashSaleId: string): Promise<boolean> {
    const fs = db.flashSales.get(flashSaleId);
    if (!fs) return false;
    const ok = fs.claimSlot();
    if (ok) {
      try {
        await executeQuery('UPDATE flash_sales SET sold_slots = sold_slots + 1 WHERE id = ?', [flashSaleId]);
      } catch (err: any) {
        console.warn('[MarketingService] MySQL flash sale slot notice:', err.message);
      }
      await redisService.del('flash_sales:all');
    }
    return ok;
  }

  /**
   * Lấy danh sách Vouchers
   * Cache-Aside: Redis -> Miss -> MySQL -> Cache
   */
  public async getVouchers(): Promise<Voucher[]> {
    return redisService.remember('vouchers:all', 300, async () => {
      try {
        const rows = await executeQuery('SELECT * FROM vouchers WHERE is_active = 1');
        if (Array.isArray(rows) && rows.length > 0) {
          const list: Voucher[] = [];
          for (const r of rows) {
            const discountType: 'PERCENTAGE' | 'FIXED' =
              r.discount_type === 'FIXED' || r.discount_type === 'AMOUNT' ? 'FIXED' : 'PERCENTAGE';
            const v = new Voucher(
              r.id,
              r.code,
              r.title,
              r.description || `Giảm giá ${r.discount_value}`,
              discountType,
              Number(r.discount_value) || 0,
              Number(r.min_order_value) || 0,
              {
                maxDiscount: r.max_discount ? Number(r.max_discount) : undefined,
                usageLimit: Number(r.usage_limit) || 1000,
                usedCount: Number(r.used_count) || 0,
                isActive: r.is_active === 1 || r.is_active === true,
                startDate: r.start_date ? new Date(r.start_date) : undefined,
                endDate: r.end_date ? new Date(r.end_date) : undefined,
              }
            );
            db.vouchers.set(v.id, v);
            list.push(v);
          }
          return list;
        }
      } catch (err: any) {
        console.warn('[MarketingService] MySQL vouchers notice:', err.message);
      }
      return Array.from(db.vouchers.values()).filter((v) => v.isActive);
    });
  }

  public async validateVoucher(code: string, orderAmount: number) {
    const vouchers = await this.getVouchers();
    const voucher = vouchers.find((v) => v.code === code.toUpperCase().trim()) ||
      Array.from(db.vouchers.values()).find((v) => v.code === code.toUpperCase().trim());

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
      voucher: typeof (voucher as any)?.toJSON === 'function' ? (voucher as any).toJSON() : voucher,
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    };
  }

  /**
   * Lấy kho Voucher cá nhân của từng sinh viên
   */
  public async getUserVouchers(userId: string): Promise<UserVoucher[]> {
    try {
      const rows = await executeQuery(
        'SELECT * FROM user_vouchers WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const list: UserVoucher[] = [];
        for (const r of rows) {
          const voucher = db.vouchers.get(r.voucher_id);
          const uv = new UserVoucher(r.id, r.user_id, r.voucher_id, {
            isUsed: r.is_used === 1 || r.is_used === true,
            usedAt: r.used_at ? new Date(r.used_at) : undefined,
            createdAt: r.created_at ? new Date(r.created_at) : undefined,
            voucher,
          });
          db.userVouchers.set(uv.id, uv);
          list.push(uv);
        }
        return list;
      }
    } catch (err: any) {
      console.warn('[MarketingService] MySQL user_vouchers notice:', err.message);
    }

    return Array.from(db.userVouchers.values())
      .filter((uv) => uv.userId === userId)
      .map((uv) => {
        if (!uv.voucher) uv.voucher = db.vouchers.get(uv.voucherId);
        return uv;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Thu thập (Lưu) voucher vào kho cá nhân của sinh viên
   */
  public async claimVoucherForUser(
    userId: string,
    voucherIdOrCode: string
  ): Promise<{ success: boolean; message: string; userVoucher?: UserVoucher }> {
    const voucher =
      db.vouchers.get(voucherIdOrCode) ||
      Array.from(db.vouchers.values()).find(
        (v) => v.code.toUpperCase() === voucherIdOrCode.toUpperCase().trim()
      );

    if (!voucher) {
      return { success: false, message: 'Voucher không tồn tại hoặc đã bị xóa' };
    }

    if (!voucher.isActive) {
      return { success: false, message: 'Voucher hiện tại không khả dụng' };
    }

    // Kiểm tra xem sinh viên đã lưu voucher này chưa
    const existing = Array.from(db.userVouchers.values()).find(
      (uv) => uv.userId === userId && uv.voucherId === voucher.id
    );

    if (existing) {
      if (existing.isUsed) {
        return { success: false, message: 'Bạn đã sử dụng voucher này trước đó' };
      }
      return { success: false, message: 'Voucher này đã có trong kho ví của bạn' };
    }

    const uvId = `uv-${Date.now()}`;
    const userVoucher = new UserVoucher(uvId, userId, voucher.id, {
      isUsed: false,
      voucher,
    });

    db.userVouchers.set(userVoucher.id, userVoucher);

    try {
      await executeQuery(
        'INSERT INTO user_vouchers (id, user_id, voucher_id, is_used) VALUES (?, ?, ?, 0)',
        [userVoucher.id, userId, voucher.id]
      );
    } catch (err: any) {
      console.warn('[MarketingService] MySQL claim user_voucher notice:', err.message);
    }

    return {
      success: true,
      message: `Đã lưu voucher ${voucher.code} vào ví của bạn thành công!`,
      userVoucher,
    };
  }
}

export const marketingService = new MarketingService();
