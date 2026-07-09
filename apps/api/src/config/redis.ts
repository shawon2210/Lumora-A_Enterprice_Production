import { createClient } from 'redis';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';

let client: ReturnType<typeof createClient> | null = null;

export async function getRedis() {
  if (!client) {
    client = createClient({ url: config.redis.url });
    client.on('error', (err) => logger.error('Redis error:', err));
    client.on('connect', () => logger.info('Connected to Redis'));
    await client.connect();
  }
  return client;
}

export async function closeRedis() {
  if (client) {
    await client.quit();
    client = null;
  }
}
