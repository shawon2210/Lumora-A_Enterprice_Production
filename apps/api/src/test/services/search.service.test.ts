import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchService } from '@/modules/search/search.service';

vi.mock('@lumora/database', () => ({
  prisma: {
    blogPost: { findMany: vi.fn() },
    user: { findMany: vi.fn() },
    media: { findMany: vi.fn() },
  },
}));

import { prisma } from '@lumora/database';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('searchService.search', () => {
  it('returns empty array for short query (< 2 chars)', async () => {
    const result = await searchService.search('a');

    expect(result).toEqual([]);
    expect(prisma.blogPost.findMany).not.toHaveBeenCalled();
  });

  it('returns empty array for empty string after trim', async () => {
    const result = await searchService.search('  ');

    expect(result).toEqual([]);
  });

  it('searches posts, users, and media', async () => {
    const mockPosts = [{ id: 'post-1', title: 'TypeScript Guide', excerpt: 'Learn TS', slug: 'typescript-guide' }];
    const mockUsers = [{ id: 'user-1', name: 'John Doe', email: 'john@example.com' }];
    const mockMedia = [{ id: 'media-1', name: 'screenshot.png', mimeType: 'image/png' }];

    vi.mocked(prisma.blogPost.findMany).mockResolvedValue(mockPosts as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(prisma.media.findMany).mockResolvedValue(mockMedia as any);

    const results = await searchService.search('typescript');

    expect(prisma.blogPost.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { title: { contains: 'typescript', mode: 'insensitive' } },
          { excerpt: { contains: 'typescript', mode: 'insensitive' } },
        ],
        status: 'PUBLISHED',
      },
      take: 10,
      select: { id: true, title: true, excerpt: true, slug: true },
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'typescript', mode: 'insensitive' } },
          { email: { contains: 'typescript', mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: { id: true, name: true, email: true },
    });
    expect(prisma.media.findMany).toHaveBeenCalledWith({
      where: { name: { contains: 'typescript', mode: 'insensitive' } },
      take: 10,
      select: { id: true, name: true, mimeType: true },
    });
    expect(results).toHaveLength(3);
  });

  it('returns results in correct format (type, title, description, url)', async () => {
    vi.mocked(prisma.blogPost.findMany).mockResolvedValue([
      { id: 'post-1', title: 'Test Post', excerpt: 'Description', slug: 'test-post' },
    ] as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.media.findMany).mockResolvedValue([] as any);

    const results = await searchService.search('test');

    expect(results[0]).toEqual({
      id: 'post-1',
      type: 'post',
      title: 'Test Post',
      description: 'Description',
      url: '/blog/test-post',
    });
  });

  it('formats user results correctly', async () => {
    vi.mocked(prisma.blogPost.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    ] as any);
    vi.mocked(prisma.media.findMany).mockResolvedValue([] as any);

    const results = await searchService.search('john');

    expect(results[0]).toEqual({
      id: 'user-1',
      type: 'user',
      title: 'John Doe',
      description: 'john@example.com',
      url: '/admin/users/user-1',
    });
  });

  it('uses email as title when user has no name', async () => {
    vi.mocked(prisma.blogPost.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: 'user-2', name: '', email: 'anon@example.com' }] as any);
    vi.mocked(prisma.media.findMany).mockResolvedValue([] as any);

    const results = await searchService.search('anon');

    expect(results[0].title).toBe('anon@example.com');
  });

  it('formats media results correctly', async () => {
    vi.mocked(prisma.blogPost.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.media.findMany).mockResolvedValue([
      { id: 'media-1', name: 'photo.jpg', mimeType: 'image/jpeg' },
    ] as any);

    const results = await searchService.search('photo');

    expect(results[0]).toEqual({
      id: 'media-1',
      type: 'media',
      title: 'photo.jpg',
      description: 'image/jpeg',
      url: '/media/media-1',
    });
  });

  it('trims whitespace from query', async () => {
    vi.mocked(prisma.blogPost.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.media.findMany).mockResolvedValue([] as any);

    await searchService.search('  hello  ');

    expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'hello', mode: 'insensitive' } },
            { excerpt: { contains: 'hello', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });

  it('limits results to 10 per type', async () => {
    vi.mocked(prisma.blogPost.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.media.findMany).mockResolvedValue([] as any);

    await searchService.search('test');

    expect(prisma.blogPost.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
    expect(prisma.media.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
  });

  it('returns empty array when nothing matches', async () => {
    vi.mocked(prisma.blogPost.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.media.findMany).mockResolvedValue([] as any);

    const results = await searchService.search('zzzzz');

    expect(results).toEqual([]);
  });
});
