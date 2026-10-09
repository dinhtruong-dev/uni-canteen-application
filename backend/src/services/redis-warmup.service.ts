import { redisService } from './redis.service';
import { otpService } from './otp.service';
import { cartService } from './cart.service';
import { Cart, Category, Canteen, Product, DiningTable, Voucher, User, PickupSlot } from '../models';

const PREFIX = 'unieat:cache:';
const key = (name: string) => `${PREFIX}${name}`;

const TTL = {
  SHORT: 1800,
  MEDIUM: 3600,
  LONG: 3600 * 2,
  DAY: 86400,
  WEEK: 86400 * 7,
};

export class RedisWarmupService {
  public async warmUpAll(): Promise<{ success: boolean; totalKeys: number; keys: string[] }> {
    console.log(`🔥 [Redis Warmup] Bắt đầu...`);

    try {
      await Promise.all([
        this.warmUpCategories(),
        this.warmUpCanteens(),
        this.warmUpProducts(),
        this.warmUpTables(),
        this.warmUpVouchers(),
        this.warmUpPickupSlots(),
        this.warmUpUsers(),
      ]);

      await this.warmUpCarts();
      await otpService.seedDemoOtps();

      await redisService.set(
        key('system:status'),
        { status: 'ONLINE', warmedAt: new Date().toISOString() },
        TTL.DAY * 30
      );

      const allKeys = await redisService.keys(`${PREFIX}*`);
      console.log(`[Redis Warmup] Xong. Tổng ${allKeys.length} keys.`);

      return { success: true, totalKeys: allKeys.length, keys: allKeys };
    } catch (err: any) {
      console.error(`[Redis Warmup Error]:`, err.message);
      return { success: false, totalKeys: 0, keys: [] };
    }
  }

  public async warmUpCategories(): Promise<void> {
    try {
      const rows = await Category.findAll({
        where: { isActive: true },
        order: [['displayOrder', 'ASC']],
      });
      await redisService.set(key('categories:all'), rows, TTL.LONG);
    } catch (err: any) {
      console.warn('[Warmup] categories:', err.message);
    }
  }

  public async warmUpCanteens(): Promise<void> {
    try {
      const rows = await Canteen.findAll({ order: [['name', 'ASC']] });
      await redisService.set(key('canteens:all'), rows, TTL.LONG);
    } catch (err: any) {
      console.warn('[Warmup] canteens:', err.message);
    }
  }

  public async warmUpProducts(): Promise<void> {
    try {
      const bestSellers = await Product.findAll({
        where: { isAvailable: true, isBestSeller: true },
        limit: 50,
        order: [['soldCount', 'DESC']],
      });
      await redisService.set(key('products:bestsellers'), bestSellers, TTL.MEDIUM);
    } catch (err: any) {
      console.warn('[Warmup] products:', err.message);
    }
  }

  public async warmUpTables(): Promise<void> {
    try {
      const rows = await DiningTable.findAll();
      await redisService.set(key('tables:all'), rows, TTL.SHORT);
    } catch (err: any) {
      console.warn('[Warmup] tables:', err.message);
    }
  }

  public async warmUpVouchers(): Promise<void> {
    try {
      const rows = await Voucher.findAll({ where: { isActive: true } });
      await redisService.set(key('vouchers:all'), rows, TTL.MEDIUM);

      const banners = [ /* ... hard-code banner tĩnh vì banner ít đổi */];
      await redisService.set(key('banners:all'), banners, TTL.MEDIUM);
    } catch (err: any) {
      console.warn('[Warmup] vouchers:', err.message);
    }
  }

  public async warmUpPickupSlots(): Promise<void> {
    try {
      // ✅ Đọc từ DB, không hard-code
      const rows = await PickupSlot.findAll();
      if (rows.length === 0) {
        console.warn('[Warmup] pickup_slots rỗng — cần seed DB trước');
      }
      await redisService.set(key('pickup_slots:all'), rows, TTL.MEDIUM);
    } catch (err: any) {
      console.warn('[Warmup] pickup_slots:', err.message);
    }
  }

  public async warmUpUsers(): Promise<void> {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'avatar', 'role'],
      });
      await redisService.set(key('users:public'), users, TTL.MEDIUM);
    } catch (err: any) {
      console.warn('[Warmup] users:', err.message);
    }
  }

  public async warmUpCarts(): Promise<void> {
    try {
      const cartGuest: Partial<Cart> = {
        userId: 'user-guest',
        items: [ /* dữ liệu demo — chỉ để UI */],
      };
      await cartService.persistCart('user-guest', cartGuest as Cart);
    } catch (err: any) {
      console.warn('[Warmup] carts:', err.message);
    }
  }
}

export const redisWarmupService = new RedisWarmupService();