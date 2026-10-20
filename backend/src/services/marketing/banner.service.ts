// src/services/marketing/banner.service.ts
import { Banner } from '../../models';
import { redisService } from '../infrastructure/redis.service';

export class BannerService {
    public async getBanners(): Promise<Banner[]> {
        return redisService.remember('banners:all', 300, async () => {
            try {
                const rows = await Banner.findAll({
                    where: { isActive: true },
                    order: [['displayOrder', 'ASC']],
                });
                return rows || [];
            } catch (err: any) {
                console.error('[BannerService.getBanners Error]:', err.message);
                throw err;
            }
        });
    }
}

export const bannerService = new BannerService();