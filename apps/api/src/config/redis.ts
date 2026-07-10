import { createClient } from 'redis';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';

export let redis: ReturnType<typeof createClient> | null = null;

export async function getRedis() {
  if (!redis) {
    const client = createClient({ url: config.redis.url });
    client.on('error', (err) => logger.error('Redis error:', err));
    client.on('connect', () => logger.info('Connected to Redis'));
    await client.connect();
    redis = client;
  }
  return redis;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
