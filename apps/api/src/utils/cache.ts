import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';

const DEFAULT_TTL = 60;

function isRedisAvailable(): boolean {
  return redis !== null && redis !== undefined;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!isRedisAvailable()) return null;
    try {
      const value = await redis!.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (err) {
      logger.warn(`Cache get failed for key "${key}":`, err);
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = DEFAULT_TTL): Promise<void> {
    if (!isRedisAvailable()) return;
    try {
      const serialized = JSON.stringify(value);
      await redis!.set(key, serialized, { EX: ttlSeconds });
    } catch (err) {
      logger.warn(`Cache set failed for key "${key}":`, err);
    }
  },

  async del(key: string): Promise<void> {
    if (!isRedisAvailable()) return;
    try {
      await redis!.del(key);
    } catch (err) {
      logger.warn(`Cache del failed for key "${key}":`, err);
    }
  },

  async delPattern(pattern: string): Promise<void> {
    if (!isRedisAvailable()) return;
    try {
      const keys = await redis!.keys(pattern);
      if (keys.length > 0) {
        await redis!.del(keys);
      }
    } catch (err) {
      logger.warn(`Cache delPattern failed for pattern "${pattern}":`, err);
    }
  },

  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds = DEFAULT_TTL): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await fetchFn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  },
};
