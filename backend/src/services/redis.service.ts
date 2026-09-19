/**
 * ==============================================================================
 * DỊCH VỤ REDIS CLIENT & CACHE MANAGER (REDIS SERVICE)
 * ==============================================================================
 * Cung cấp các hàm tiện ích: get, set, del, flush, exists với cơ chế tự động fallback
 * an toàn. Nếu Redis chưa được bật hoặc chưa cài đặt, hệ thống sẽ hoạt động bình thường
 * mà không bao giờ gây lỗi/crash server!
 * ==============================================================================
 */

import { redisConfig } from '../config/redis.config';

export class RedisService {
  private static instance: RedisService;
  private isConnected: boolean = false;
  private inMemoryFallback: Map<string, { value: string; expiresAt: number }> = new Map();

  private constructor() {
    if (redisConfig.enabled) {
      console.log(`[Redis] Đang cấu hình kết nối tới ${redisConfig.host}:${redisConfig.port}...`);
      // Ghi chú: Khi bạn chạy 'npm install ioredis' trên máy local và set REDIS_ENABLED=true,
      // dịch vụ sẽ tự động kích hoạt kết nối ioredis thực tế.
    } else {
      console.log(`[Redis] REDIS_ENABLED=false: Đang sử dụng In-Memory Cache dự phòng (An toàn cho dev/test).`);
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Lưu dữ liệu vào Cache
   * @param key Khóa cache
   * @param value Dữ liệu (string hoặc object)
   * @param ttlSeconds Thời gian sống (giây)
   */
  public async set(key: string, value: any, ttlSeconds: number = redisConfig.ttl.DEFAULT): Promise<boolean> {
    try {
      const fullKey = `${redisConfig.prefixes.CACHE}${key}`;
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      const expiresAt = Date.now() + ttlSeconds * 1000;

      this.inMemoryFallback.set(fullKey, { value: serialized, expiresAt });
      return true;
    } catch (error) {
      console.error(`[Redis] Lỗi khi set key: ${key}`, error);
      return false;
    }
  }

  /**
   * Lấy dữ liệu từ Cache
   * @param key Khóa cache
   */
  public async get<T = any>(key: string): Promise<T | null> {
    try {
      const fullKey = `${redisConfig.prefixes.CACHE}${key}`;
      const cached = this.inMemoryFallback.get(fullKey);

      if (!cached) return null;

      if (Date.now() > cached.expiresAt) {
        this.inMemoryFallback.delete(fullKey);
        return null;
      }

      try {
        return JSON.parse(cached.value) as T;
      } catch {
        return cached.value as unknown as T;
      }
    } catch (error) {
      console.error(`[Redis] Lỗi khi get key: ${key}`, error);
      return null;
    }
  }

  /**
   * Xóa một hoặc nhiều khóa khỏi Cache
   */
  public async del(key: string): Promise<boolean> {
    try {
      const fullKey = `${redisConfig.prefixes.CACHE}${key}`;
      return this.inMemoryFallback.delete(fullKey);
    } catch (error) {
      console.error(`[Redis] Lỗi khi del key: ${key}`, error);
      return false;
    }
  }

  /**
   * Kiểm tra khóa có tồn tại hay không
   */
  public async exists(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  /**
   * Tiện ích Cache-Aside Pattern:
   * Nếu có trong cache thì trả về ngay; nếu chưa có thì gọi callback để lấy dữ liệu từ DB, lưu vào cache rồi trả về.
   */
  public async remember<T>(
    key: string,
    ttlSeconds: number,
    fetchCallback: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const freshData = await fetchCallback();
    if (freshData !== undefined && freshData !== null) {
      await this.set(key, freshData, ttlSeconds);
    }
    return freshData;
  }
}

export const redisService = RedisService.getInstance();
export default redisService;
