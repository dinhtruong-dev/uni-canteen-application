/**
 * ==============================================================================
 * DỊCH VỤ REDIS CLIENT & CACHE MANAGER (REDIS SERVICE)
 * ==============================================================================
 * Cung cấp kết nối trực tiếp qua thư viện 'ioredis' với cơ chế tự động fallback
 * sang In-Memory an toàn nếu Redis server tạm thời ngắt kết nối.
 *
 * Đã tối ưu:
 *  - Dùng SCAN thay KEYS (không block Redis)
 *  - Clear fallback khi Redis reconnect (tránh memory leak)
 *  - Lock cho remember() (tránh thundering herd)
 * ==============================================================================
 */

import Redis from 'ioredis';
import { redisConfig } from '../config/redis.config';

export class RedisService {
  private static instance: RedisService;
  private client: Redis | null = null;
  private isConnected: boolean = false;

  /** Cache dự phòng khi Redis chết */
  private inMemoryFallback: Map<
    string,
    { value: any; expiresAt: number }
  > = new Map();

  /** Lock để tránh nhiều request cùng fetch 1 key khi miss cache */
  private pendingFetches: Map<string, Promise<any>> = new Map();

  private constructor() {
    if (redisConfig.enabled) {
      this.initRedisClient();
    } else {
      console.log(
        `[Redis] REDIS_ENABLED=false: Đang sử dụng In-Memory Cache dự phòng.`
      );
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private initRedisClient(): void {
    try {
      console.log(
        `[Redis] Đang kết nối tới ${redisConfig.host}:${redisConfig.port} (DB: ${redisConfig.db})...`
      );

      this.client = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
        db: redisConfig.db,
        connectTimeout: redisConfig.connectTimeout || 10000,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 10) {
            console.warn(
              '[Redis] Quá 10 lần thử kết nối không thành công. Dùng In-Memory fallback.'
            );
            return null;
          }
          return Math.min(times * 200, 2000);
        },
      });

      this.client.on('connect', () => {
        console.log(
          `[Redis] Đã kết nối TCP tới ${redisConfig.host}:${redisConfig.port}`
        );
      });

      this.client.on('ready', () => {
        this.isConnected = true;

        if (this.inMemoryFallback.size > 0) {
          console.log(
            `[Redis] Đã reconnect. Xóa ${this.inMemoryFallback.size} key fallback cũ.`
          );
          this.inMemoryFallback.clear();
        }
        console.log(`[Redis] Redis Client sẵn sàng!`);
      });

      this.client.on('error', (err: any) => {
        this.isConnected = false;
        console.warn(
          `[Redis Client Warning]: ${err.message}. Tạm dùng In-Memory fallback.`
        );
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

 
  public normalizeKey(key: string): string {
    if (
      key.startsWith('unieat:') ||
      key.startsWith('cart:') ||
      key.startsWith('otp:') ||
      key.startsWith('session:')
    ) {
      return key;
    }
    return `${redisConfig.prefixes.CACHE}${key}`;
  }

  public async set(
    key: string,
    value: any,
    ttlSeconds: number = redisConfig.ttl.DEFAULT
  ): Promise<boolean> {
    const fullKey = this.normalizeKey(key);
    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value);

    // 1. Redis thật
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds > 0) {
          await this.client.set(fullKey, serialized, 'EX', ttlSeconds);
        } else {
          await this.client.set(fullKey, serialized);
        }
        return true;
      } catch (err: any) {
        console.warn(
          `[Redis set error]: ${err.message}. Ghi vào In-Memory fallback.`
        );
      }
    }

    // 2. Fallback RAM
    try {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.inMemoryFallback.set(fullKey, { value, expiresAt });
      return true;
    } catch {
      return false;
    }
  }

  public async get<T = any>(key: string): Promise<T | null> {
    const fullKey = this.normalizeKey(key);

    // 1. Redis thật
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
        console.warn(
          `[Redis get error]: ${err.message}. Đọc từ In-Memory fallback.`
        );
      }
    }

    // 2. Fallback RAM
    const cached = this.inMemoryFallback.get(fullKey);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.inMemoryFallback.delete(fullKey);
      return null;
    }
    return cached.value as T;
  }

  public async del(key: string): Promise<boolean> {
    const fullKey = this.normalizeKey(key);

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

  public async exists(key: string): Promise<boolean> {
    const fullKey = this.normalizeKey(key);

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

  public async ttl(key: string): Promise<number> {
    const fullKey = this.normalizeKey(key);

    if (this.isConnected && this.client) {
      try {
        return await this.client.ttl(fullKey);
      } catch {
        // fallback
      }
    }

    const cached = this.inMemoryFallback.get(fullKey);
    if (!cached) return -2;
    const remaining = Math.ceil((cached.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  
  public async delPrefix(prefix: string): Promise<boolean> {
    const fullPrefix = this.normalizeKey(prefix);

    if (this.isConnected && this.client) {
      try {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await this.client.scan(
            cursor,
            'MATCH',
            `${fullPrefix}*`,
            'COUNT',
            100
          );
          cursor = nextCursor;
          if (keys.length > 0) {
            await this.client.del(...keys);
          }
        } while (cursor !== '0');
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

  public async keys(pattern: string = '*'): Promise<string[]> {
    if (this.isConnected && this.client) {
      try {
        const result: string[] = [];
        let cursor = '0';
        do {
          const [nextCursor, batch] = await this.client.scan(
            cursor,
            'MATCH',
            pattern,
            'COUNT',
            100
          );
          cursor = nextCursor;
          result.push(...batch);
        } while (cursor !== '0');
        return result;
      } catch (err: any) {
        console.warn(`[Redis keys error]: ${err.message}`);
      }
    }

    const all = Array.from(this.inMemoryFallback.keys());
    if (pattern === '*') return all;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return all.filter((k) => regex.test(k));
  }

  public async getInfo(): Promise<{
    isConnected: boolean;
    totalKeys: number;
    keysList: string[];
  }> {
    const allKeys = await this.keys('*');
    return {
      isConnected: this.isConnected,
      totalKeys: allKeys.length,
      keysList: allKeys,
    };
  }

  public async remember<T>(
    key: string,
    ttlSeconds: number,
    fetchCallback: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    if (this.pendingFetches.has(key)) {
      return this.pendingFetches.get(key)!;
    }

    // 3. Fetch + cache
    const promise = (async () => {
      try {
        const freshData = await fetchCallback();
        if (freshData !== undefined && freshData !== null) {
          await this.set(key, freshData, ttlSeconds);
        }
        return freshData;
      } finally {
        this.pendingFetches.delete(key);
      }
    })();

    this.pendingFetches.set(key, promise);
    return promise;
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
        this.client = null;
        this.isConnected = false;
        console.log('[Redis] Đã đóng kết nối.');
      }
    } catch (err: any) {
      console.warn('[Redis disconnect error]:', err.message);
    }
  }
}

export const redisService = RedisService.getInstance();
export default redisService;