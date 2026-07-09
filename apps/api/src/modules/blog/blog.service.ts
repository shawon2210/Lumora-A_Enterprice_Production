import { blogRepository } from './blog.repository';
import { NotFoundError, ForbiddenError } from '@/utils/errors';
import { generateSlug, makeUniqueSlug } from '@/utils/slug';
import { getPaginationParams, buildPaginationMeta } from '@/utils/pagination';

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

function formatPost(post: PostRaw) {
  const {
    author,
    tags: postTags,
    authorId: _authorId,
    seoTitle: _seoTitle,
    seoDescription: _seoDescription,
    canonicalUrl: _canonicalUrl,
    ...rest
  } = post as any;
  return {
    ...rest,
    author: { id: author.id, name: author.name, avatar: author.avatar },
    tags: postTags?.map((pt: any) => pt.tag?.name).filter(Boolean) ?? [],
  };
}

export class BlogService {
  async listPosts(query: Record<string, unknown>) {
    const { page, limit, skip } = getPaginationParams(query as any);
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
  }

  async getPost(slug: string) {
    const post = await blogRepository.findPostBySlug(slug);
    if (!post) throw new NotFoundError('Blog post');
    return formatPost(post);
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

    return formatPost(post);
  }

  async updatePost(id: string, user: { id: string; role: string }, input: UpdatePostInput) {
    const existing = await blogRepository.findPostById(id);
    if (!existing) throw new NotFoundError('Blog post');
    if (existing.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('Not authorized to update this post');
    }

    const data: Record<string, unknown> = {};
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

    const post = await blogRepository.updatePost(id, data as any);
    return formatPost(post);
  }

  async deletePost(id: string, user: { id: string; role: string }) {
    const existing = await blogRepository.findPostById(id);
    if (!existing) throw new NotFoundError('Blog post');
    if (existing.authorId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('Not authorized to delete this post');
    }
    await blogRepository.deletePost(id);
  }
}

export const blogService = new BlogService();
