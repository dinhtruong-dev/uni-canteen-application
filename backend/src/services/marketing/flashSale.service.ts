// src/services/marketing/flashSale.service.ts
import { Op, literal } from 'sequelize';
import { FlashSale, Product } from '../../models';
import { redisService } from '../infrastructure/redis.service';

export class FlashSaleService {
    public async getFlashSales(): Promise<FlashSale[]> {
        return redisService.remember('flash_sales:all', 120, async () => {
            const now = new Date();
            const rows = await FlashSale.findAll({
                where: { startTime: { [Op.lte]: now }, endTime: { [Op.gte]: now } },
            });

            if (!Array.isArray(rows) || rows.length === 0) return [];

            const productIds = rows.map((fs) => fs.productId).filter(Boolean);
            const products = await Product.findAll({ where: { id: productIds } });
            const productMap = new Map(products.map((p) => [p.id, p]));

            for (const fs of rows) {
                const prod = productMap.get(fs.productId);
                if (prod) {
                    fs.productName = prod.name;
                    fs.productImage = prod.image;
                }
            }
            return rows;
        });
    }

    public async claimFlashSaleSlot(flashSaleId: string): Promise<boolean> {
        try {
            const [affected] = await FlashSale.update(
                { soldSlots: literal('sold_slots + 1') as any },
                {
                    where: {
                        id: flashSaleId,
                        soldSlots: { [Op.lt]: literal('total_slots') },
                    },
                }
            );

            if (affected === 0) return false;

            await redisService.del('flash_sales:all');
            return true;
        } catch (err: any) {
            console.error('[FlashSaleService.claimFlashSaleSlot Error]:', err.message);
            throw err;
        }
    }
}

export const flashSaleService = new FlashSaleService();