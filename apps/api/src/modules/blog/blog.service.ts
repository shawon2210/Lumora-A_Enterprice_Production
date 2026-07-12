import { blogRepository, type UpdatePostData } from './blog.repository';
import { NotFoundError, ForbiddenError } from '@/utils/errors';
import { generateSlug, makeUniqueSlug } from '@/utils/slug';
import { getPaginationParams, buildPaginationMeta, type PaginateParams } from '@/utils/pagination';
import { cache } from '@/utils/cache';

interface CreatePostInput {
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  tags?: string[];
}

interface UpdatePostInput {
  title?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags?: string[];
}

type PostRaw = NonNullable<Awaited<ReturnType<typeof blogRepository.findPostBySlug>>>;

type FormattedPost = Omit<PostRaw, 'author' | 'tags' | 'authorId' | 'seoTitle' | 'seoDescription' | 'canonicalUrl'> & {
  author: { id: string; name: string; avatar: string | null };
  tags: string[];
};

function formatPost(post: PostRaw): FormattedPost {
  const {
    author,
    tags: postTags,
    authorId: _authorId,
    seoTitle: _seoTitle,
    seoDescription: _seoDescription,
    canonicalUrl: _canonicalUrl,
    ...rest
  } = post;
  return {
    ...rest,
    author: { id: author.id, name: author.name, avatar: author.avatar },
    tags:
      (postTags as Array<{ tag?: { name?: string } }>)
        .map((pt) => pt.tag?.name)
        .filter((name): name is string => Boolean(name)) ?? [],
  } as FormattedPost;
}

export class BlogService {
  async listPosts(query: Record<string, unknown>) {
    return cache.getOrSet(
      `blog:posts:${JSON.stringify(query)}`,
      async () => {
        const { page, limit, skip } = getPaginationParams(query as PaginateParams);
        const status = query.status as string | undefined;
        const search = query.search as string | undefined;
        const authorId = query.authorId as string | undefined;

        const [posts, total] = await Promise.all([
          blogRepository.findPosts({ page, limit, skip, status, search, authorId }),
          blogRepository.countPosts({ status, search, authorId }),
        ]);

        return {
          posts: posts.map(formatPost),
          meta: buildPaginationMeta(total, page, limit),
        };
      },
      60,
    );
  }

  async getPostById(id: string) {
    const post = await blogRepository.findPostById(id);
    if (!post) throw new NotFoundError('Blog post');
    return formatPost(post);
  }

  async getPost(slug: string): Promise<FormattedPost> {
    const cached = await cache.get<FormattedPost | null>(`blog:post:${slug}`);
    if (cached !== null) return cached;

    const post = await blogRepository.findPostBySlug(slug);
    if (!post) throw new NotFoundError('Blog post');
    const formatted = formatPost(post);

    if (post.status === 'PUBLISHED') {
      await cache.set(`blog:post:${slug}`, formatted, 120);
    }

    return formatted;
  }

  async createPost(user: { id: string; role: string }, input: CreatePostInput) {
    let slug = generateSlug(input.title);
    const existing = await blogRepository.findPostBySlug(slug);
    if (existing) slug = makeUniqueSlug(slug);

    const post = await blogRepository.createPost({
      title: input.title,
      slug,
      excerpt: input.excerpt ?? null,
      content: input.content ?? null,
      coverImage: input.coverImage ?? null,
      authorId: user.id,
      status: input.status ?? 'DRAFT',
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
      tags: input.tags,
    });

    await cache.delPattern('blog:posts:*');
    await cache.delPattern('search:*');
    if (post.status === 'PUBLISHED') {
      await cache.del(`blog:post:${post.slug}`);
    }

    return formatPost(post);
  }

  async updatePost(id: string, user: { id: string; role: string }, input: UpdatePostInput) {
    const existing = await blogRepository.findPostById(id);
    if (!existing) throw new NotFoundError('Blog post');
    if (existing.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('Not authorized to update this post');
    }

    const data: UpdatePostData = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.excerpt !== undefined) data.excerpt = input.excerpt;
    if (input.content !== undefined) data.content = input.content;
    if (input.coverImage !== undefined) data.coverImage = input.coverImage;
    if (input.status !== undefined) {
      data.status = input.status;
      if (input.status === 'PUBLISHED' && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }
    if (input.tags !== undefined) data.tags = input.tags;

    const post = await blogRepository.updatePost(id, data);

    await cache.delPattern('blog:posts:*');
    await cache.delPattern('blog:post:*');
    await cache.delPattern('search:*');

    return formatPost(post);
  }

  async deletePost(id: string, user: { id: string; role: string }) {
    const existing = await blogRepository.findPostById(id);
    if (!existing) throw new NotFoundError('Blog post');
    if (existing.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('Not authorized to delete this post');
    }
    await blogRepository.deletePost(id);

    await cache.delPattern('blog:posts:*');
    await cache.delPattern('blog:post:*');
    await cache.delPattern('search:*');
  }
}

export const blogService = new BlogService();
