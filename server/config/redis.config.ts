/**
 * ==============================================================================
 * CẤU HÌNH KẾT NỐI REDIS CACHE & PUBSUB (REDIS CONFIGURATION)
 * ==============================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

export const redisConfig = {
  enabled: process.env.REDIS_ENABLED === 'true',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),

  ttl: {
    DEFAULT: 3600,
    MENU_CATEGORIES: 1800,
    BESTSELLERS: 600,
    FLASH_SALE: 300,
    DINING_TABLES: 60,
    USER_SESSION: 86400 * 7,
  },

  prefixes: {
    CACHE: 'unieat:cache:',
    SESSION: 'unieat:session:',
    OTP: 'unieat:otp:',
    RATE_LIMIT: 'unieat:ratelimit:',
    LOCK: 'unieat:lock:',
  },
};
