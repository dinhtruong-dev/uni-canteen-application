/**
 * ==============================================================================
 * DỊCH VỤ REDIS CLIENT & CACHE MANAGER
 * ==============================================================================
 */

import { redisConfig } from '../config/redis.config';

export class RedisService {
  private static instance: RedisService;
  private inMemoryFallback: Map<string, { value: string; expiresAt: number }> = new Map();

  private constructor() {}

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async set(key: string, value: any, ttlSeconds: number = redisConfig.ttl.DEFAULT): Promise<boolean> {
    try {
      const fullKey = `${redisConfig.prefixes.CACHE}${key}`;
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.inMemoryFallback.set(fullKey, { value: serialized, expiresAt });
      return true;
    } catch {
      return false;
    }
  }

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
    } catch {
      return null;
    }
  }

  public async del(key: string): Promise<boolean> {
    try {
      const fullKey = `${redisConfig.prefixes.CACHE}${key}`;
      return this.inMemoryFallback.delete(fullKey);
    } catch {
      return false;
    }
  }

  public async exists(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

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
