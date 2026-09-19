import { apiClient } from './apiClient';
import { BannerItem, FlashSaleItem, Promotion } from '../../types';

export class MarketingService {
  public async getBanners(): Promise<BannerItem[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/marketing/banners');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((b: any, index: number) => {
        let badge = '🎁 ƯU ĐÃI';
        let badgeBg = 'bg-[#FF4F8B] text-white';
        let promoCode = 'UNIEAT';

        if (b.title.includes('Mắm Tỏi') || b.targetId === 'prod-1') {
          badge = '🎁 MUA 1 TẶNG 1';
          badgeBg = 'bg-[#FF4F8B] text-white';
          promoCode = 'MUA1TANG1';
        } else if (b.title.includes('Bún & Phở')) {
          badge = '⚡ FLASH SALE TẬN PHÒNG';
          badgeBg = 'bg-[#FF7A59] text-white';
          promoCode = 'BUNPHO19K';
        } else if (b.title.includes('Giao Hàng 0 Đồng') || b.title.includes('FREESHIP')) {
          badge = '🚚 FREESHIP KTX 0Đ';
          badgeBg = 'bg-[#22C55E] text-white';
          promoCode = 'FREESHIPKTX';
        } else if (b.title.includes('Bữa Tối Sinh Viên') || b.title.includes('29')) {
          badge = '🍱 COMBO TIẾT KIỆM';
          badgeBg = 'bg-[#E83E78] text-white';
          promoCode = 'COMBO29K';
        }

        return {
          id: b.id || `banner-${index + 1}`,
          badge,
          title: b.title,
          subtitle: b.subtitle || '',
          description: b.subtitle || 'Ưu đãi đặc quyền dành cho sinh viên trường',
          image: b.imageUrl,
          badgeBg,
          promoCode,
          targetType: b.targetType,
          targetId: b.targetId,
          displayOrder: b.displayOrder,
          isActive: b.isActive,
        };
      });
    }
    return [];
  }

  public async getFlashSales(): Promise<FlashSaleItem[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/marketing/flash-sales');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((fs: any) => ({
        id: fs.id,
        title: fs.title,
        description: fs.description,
        productId: fs.productId,
        productName: fs.productName,
        productImage: fs.productImage,
        originalPrice: Number(fs.originalPrice),
        salePrice: Number(fs.salePrice),
        discountPercent: Number(fs.discountPercent),
        totalSlots: Number(fs.totalSlots),
        soldSlots: Number(fs.soldSlots),
        remainingSlots: Number(fs.remainingSlots ?? (fs.totalSlots - fs.soldSlots)),
        startTime: fs.startTime,
        endTime: fs.endTime,
        isOngoing: fs.isOngoing !== false,
      }));
    }
    return [];
  }

  public async getVouchers(): Promise<Promotion[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/marketing/vouchers');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((v: any) => ({
        id: v.id,
        code: v.code,
        title: v.title,
        description: v.description,
        discountType: v.discountType === 'PERCENTAGE' ? 'PERCENT' : 'FIXED',
        discountValue: Number(v.discountValue),
        minOrderValue: Number(v.minOrderAmount || 0),
        maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : undefined,
        startDate: v.startDate,
        endDate: v.endDate,
        usageLimit: Number(v.usageLimit || 1000),
        usedCount: Number(v.usedCount || 0),
        isAvailable: v.isActive !== false,
      }));
    }
    return [];
  }

  public async validateVoucher(code: string, orderAmount: number) {
    return apiClient.post('/marketing/vouchers/validate', { code, orderAmount });
  }
}

export const marketingService = new MarketingService();
