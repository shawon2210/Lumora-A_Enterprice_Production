import { prisma } from '@lumora/database';
import { cache } from '@/utils/cache';

const SEARCH_TAKE = 10;

interface SearchResultItem {
  id: string;
  type: 'post' | 'user' | 'media';
  title: string;
  description: string | null;
  url: string;
}

export const searchService = {
  async search(q: string): Promise<SearchResultItem[]> {
    const term = q.trim();
    if (term.length < 2) return [];

    return cache.getOrSet(
      `search:${term}`,
      async () => {
        const like = { contains: term, mode: 'insensitive' as const };

        const [posts, users, media] = await Promise.all([
          prisma.blogPost.findMany({
            where: { OR: [{ title: like }, { excerpt: like }], status: 'PUBLISHED' },
            take: SEARCH_TAKE,
            select: { id: true, title: true, excerpt: true, slug: true },
          }),
          prisma.user.findMany({
            where: { OR: [{ name: like }, { email: like }] },
            take: SEARCH_TAKE,
            select: { id: true, name: true, email: true },
          }),
          prisma.media.findMany({
            where: { name: like },
            take: SEARCH_TAKE,
            select: { id: true, name: true, mimeType: true },
          }),
        ]);

        return [
          ...posts.map((p) => ({
            id: p.id,
            type: 'post' as const,
            title: p.title,
            description: p.excerpt,
            url: `/blog/${p.slug}`,
          })),
          ...users.map((u) => ({
            id: u.id,
            type: 'user' as const,
            title: u.name || u.email,
            description: u.email,
            url: `/admin/users/${u.id}`,
          })),
          ...media.map((m) => ({
            id: m.id,
            type: 'media' as const,
            title: m.name,
            description: m.mimeType,
            url: `/media/${m.id}`,
          })),
        ];
      },
      120,
    );
  },
};
