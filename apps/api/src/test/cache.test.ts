import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRedis = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
}));

vi.mock('@/config/redis', () => ({ redis: mockRedis as any }));

import { cache } from '../utils/cache';

describe('cache utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('get returns null for missing key', async () => {
    mockRedis.get.mockResolvedValue(null);
    expect(await cache.get('missing')).toBeNull();
  });

  it('get returns parsed value for existing key', async () => {
    const data = { foo: 'bar' };
    mockRedis.get.mockResolvedValue(JSON.stringify(data));
    expect(await cache.get('exists')).toEqual(data);
  });

  it('set stores serialized value with default TTL', async () => {
    await cache.set('key', { hello: 'world' });
    expect(mockRedis.set).toHaveBeenCalledWith('key', JSON.stringify({ hello: 'world' }), { EX: 60 });
  });

  it('set stores serialized value with custom TTL', async () => {
    await cache.set('key', 'value', 120);
    expect(mockRedis.set).toHaveBeenCalledWith('key', '"value"', { EX: 120 });
  });

  it('del removes key', async () => {
    await cache.del('some-key');
    expect(mockRedis.del).toHaveBeenCalledWith('some-key');
  });

  it('delPattern removes matching keys', async () => {
    mockRedis.keys.mockResolvedValue(['k1', 'k2']);
    await cache.delPattern('test:*');
    expect(mockRedis.keys).toHaveBeenCalledWith('test:*');
    expect(mockRedis.del).toHaveBeenCalledWith(['k1', 'k2']);
  });

  it('delPattern does nothing when no keys match', async () => {
    mockRedis.keys.mockResolvedValue([]);
    await cache.delPattern('empty:*');
    expect(mockRedis.keys).toHaveBeenCalledWith('empty:*');
    expect(mockRedis.del).not.toHaveBeenCalled();
  });

  it('getOrSet calls fetchFn and caches on miss', async () => {
    mockRedis.get.mockResolvedValue(null);
    const fetchFn = vi.fn().mockResolvedValue('computed');
    expect(await cache.getOrSet('miss', fetchFn)).toBe('computed');
    expect(fetchFn).toHaveBeenCalledOnce();
    expect(mockRedis.set).toHaveBeenCalledWith('miss', '"computed"', { EX: 60 });
  });

  it('getOrSet returns cached value on hit', async () => {
    mockRedis.get.mockResolvedValue(JSON.stringify('cached'));
    const fetchFn = vi.fn();
    expect(await cache.getOrSet('hit', fetchFn)).toBe('cached');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('getOrSet uses custom TTL', async () => {
    mockRedis.get.mockResolvedValue(null);
    const fetchFn = vi.fn().mockResolvedValue('data');
    await cache.getOrSet('custom-ttl', fetchFn, 30);
    expect(mockRedis.set).toHaveBeenCalledWith('custom-ttl', '"data"', { EX: 30 });
  });

  it('gracefully handles redis being unavailable', async () => {
    vi.resetModules();
    vi.doMock('@/config/redis', () => ({ redis: null }));
    const { cache: nullCache } = await import('../utils/cache');

    await expect(nullCache.get('key')).resolves.toBeNull();
    await expect(nullCache.set('key', 'val')).resolves.toBeUndefined();
    await expect(nullCache.del('key')).resolves.toBeUndefined();
    await expect(nullCache.delPattern('pat:*')).resolves.toBeUndefined();
    const fetchFn = vi.fn().mockResolvedValue('fallback');
    await expect(nullCache.getOrSet('key', fetchFn)).resolves.toBe('fallback');
    expect(fetchFn).toHaveBeenCalledOnce();
  });
});
