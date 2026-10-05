/**
 * ==============================================================================
 * DỊCH VỤ REDIS CLIENT & CACHE MANAGER (REDIS SERVICE)
 * ==============================================================================
 * Cung cấp kết nối trực tiếp qua thư viện 'ioredis' với cơ chế tự động fallback
 * sang In-Memory an toàn nếu Redis server tạm thời ngắt kết nối.
 * ==============================================================================
 */

import Redis from 'ioredis';
import { redisConfig } from '../config/redis.config';

export class RedisService {
  private static instance: RedisService;
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private inMemoryFallback: Map<string, { value: any; expiresAt: number }> = new Map();

  private constructor() {
    if (redisConfig.enabled) {
      this.initRedisClient();
    } else {
      console.log(`[Redis] REDIS_ENABLED=false: Đang sử dụng In-Memory Cache dự phòng.`);
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Khởi tạo kết nối ioredis thực tế
   */
  private initRedisClient(): void {
    try {
      console.log(`[Redis] Đang kết nối tới máy chủ Redis: ${redisConfig.host}:${redisConfig.port} (DB: ${redisConfig.db})...`);

      this.client = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
        db: redisConfig.db,
        connectTimeout: redisConfig.connectTimeout || 10000,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 10) {
            console.warn('[Redis] Quá 10 lần thử kết nối không thành công. Sử dụng In-Memory fallback.');
            return null; // Dừng retry vô hạn
          }
          return Math.min(times * 200, 2000);
        },
      });

      this.client.on('connect', () => {
        console.log(`[Redis] ✅ Đã kết nối TCP thành công tới ${redisConfig.host}:${redisConfig.port}`);
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        console.log(`[Redis] 🚀 Redis Client đã sẵn sàng phục vụ lưu trữ Cache & OTP!`);
      });

      this.client.on('error', (err: any) => {
        this.isConnected = false;
        console.warn(`[Redis Client Warning]: ${err.message}. Hệ thống tạm chuyển sang chế độ In-Memory an toàn.`);
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });
    } catch (err: any) {
      this.isConnected = false;
      console.error('[Redis Client Init Error]:', err.message);
    }
  }

  public isRedisReady(): boolean {
    return this.isConnected;
  }

  public getRawClient(): Redis | null {
    return this.client;
  }

  /**
   * Lưu dữ liệu vào Cache / OTP Store với thời gian sống TTL (giây)
   */
  public async set(key: string, value: any, ttlSeconds: number = redisConfig.ttl.DEFAULT): Promise<boolean> {
    const fullKey = (key.startsWith('unieat:') || key.startsWith('cart:')) ? key : `${redisConfig.prefixes.CACHE}${key}`;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    // 1. Ghi vào Redis thực tế nếu đang online
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds > 0) {
          await this.client.set(fullKey, serialized, 'EX', ttlSeconds);
        } else {
          await this.client.set(fullKey, serialized);
        }
        return true;
      } catch (err: any) {
        console.warn(`[Redis set error]: ${err.message}. Ghi vào In-Memory fallback.`);
      }
    }

    // 2. Fallback bộ nhớ RAM
    try {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.inMemoryFallback.set(fullKey, { value, expiresAt });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lấy dữ liệu từ Cache / OTP Store
   */
  public async get<T = any>(key: string): Promise<T | null> {
    const fullKey = (key.startsWith('unieat:') || key.startsWith('cart:')) ? key : `${redisConfig.prefixes.CACHE}${key}`;

    // 1. Đọc từ Redis thực tế
    if (this.isConnected && this.client) {
      try {
        const raw = await this.client.get(fullKey);
        if (raw === null || raw === undefined) return null;
        try {
          return JSON.parse(raw) as T;
        } catch {
          return raw as unknown as T;
        }
      } catch (err: any) {
        console.warn(`[Redis get error]: ${err.message}. Đọc từ In-Memory fallback.`);
      }
    }

    // 2. Fallback bộ nhớ RAM
    const cached = this.inMemoryFallback.get(fullKey);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.inMemoryFallback.delete(fullKey);
      return null;
    }

    return cached.value as T;
  }

  /**
   * Xóa một khóa khỏi Cache / OTP Store
   */
  public async del(key: string): Promise<boolean> {
    const fullKey = (key.startsWith('unieat:') || key.startsWith('cart:')) ? key : `${redisConfig.prefixes.CACHE}${key}`;

    if (this.isConnected && this.client) {
      try {
        await this.client.del(fullKey);
      } catch (err: any) {
        console.warn(`[Redis del error]: ${err.message}`);
      }
    }

    this.inMemoryFallback.delete(fullKey);
    return true;
  }

  /**
   * Kiểm tra khóa có tồn tại hay không
   */
  public async exists(key: string): Promise<boolean> {
    const fullKey = (key.startsWith('unieat:') || key.startsWith('cart:')) ? key : `${redisConfig.prefixes.CACHE}${key}`;

    if (this.isConnected && this.client) {
      try {
        const existsCount = await this.client.exists(fullKey);
        return existsCount > 0;
      } catch {
        // fallback
      }
    }

    const val = await this.get(key);
    return val !== null;
  }

  /**
   * Lấy thời gian sống còn lại (giây) của khóa
   */
  public async ttl(key: string): Promise<number> {
    const fullKey = (key.startsWith('unieat:') || key.startsWith('cart:')) ? key : `${redisConfig.prefixes.CACHE}${key}`;

    if (this.isConnected && this.client) {
      try {
        return await this.client.ttl(fullKey);
      } catch {
        // fallback
      }
    }

    const cached = this.inMemoryFallback.get(fullKey);
    if (!cached) return -2; // -2 nghĩa là key không tồn tại theo chuẩn redis
    const remaining = Math.ceil((cached.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  /**
   * Xóa tất cả các khóa có tiền tố nhất định
   */
  public async delPrefix(prefix: string): Promise<boolean> {
    const fullPrefix = (prefix.startsWith('unieat:') || prefix.startsWith('cart:')) ? prefix : `${redisConfig.prefixes.CACHE}${prefix}`;

    if (this.isConnected && this.client) {
      try {
        const keys = await this.client.keys(`${fullPrefix}*`);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch (err: any) {
        console.warn(`[Redis delPrefix error]: ${err.message}`);
      }
    }

    for (const k of Array.from(this.inMemoryFallback.keys())) {
      if (k.startsWith(fullPrefix)) {
        this.inMemoryFallback.delete(k);
      }
    }
    return true;
  }

  /**
   * Tiện ích Cache-Aside Pattern
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
