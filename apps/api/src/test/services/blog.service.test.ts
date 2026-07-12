/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlogService } from '@/modules/blog/blog.service';
import { blogRepository } from '@/modules/blog/blog.repository';
import { generateSlug, makeUniqueSlug } from '@/utils/slug';
import { getPaginationParams, buildPaginationMeta } from '@/utils/pagination';
import { NotFoundError, ForbiddenError } from '@/utils/errors';

vi.mock('@/modules/blog/blog.repository');
vi.mock('@/utils/slug');
vi.mock('@/utils/pagination');

const mockAuthor = { id: 'author-1', name: 'Author Name', avatar: null };
const mockTag = { tag: { name: 'typescript' } };

const mockPostRaw = {
  id: 'post-1',
  title: 'Test Post',
  slug: 'test-post',
  excerpt: 'An excerpt',
  content: 'Content here',
  coverImage: null,
  status: 'PUBLISHED',
  publishedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  authorId: 'author-1',
  author: { ...mockAuthor, role: 'USER' },
  tags: [mockTag],
  seoTitle: null,
  seoDescription: null,
  canonicalUrl: null,
};

const mockPostRawDraft = {
  ...mockPostRaw,
  id: 'post-2',
  slug: 'draft-post',
  status: 'DRAFT',
  publishedAt: null,
  tags: [],
};

const mockPaginationParams = { page: 1, limit: 20, skip: 0 };
const mockPaginationMeta = {
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

const mockUser = { id: 'author-1', role: 'USER' };
const mockAdmin = { id: 'admin-1', role: 'ADMIN' };

let blogService: BlogService;

beforeEach(() => {
  vi.resetAllMocks();
  blogService = new BlogService();
});

describe('BlogService.listPosts', () => {
  it('returns paginated posts', async () => {
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(blogRepository.findPosts).mockResolvedValue([mockPostRaw] as any);
    vi.mocked(blogRepository.countPosts).mockResolvedValue(1);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    const result = await blogService.listPosts({});

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0]).not.toHaveProperty('authorId');
    expect(result.posts[0].author).toEqual(mockAuthor);
    expect(result.posts[0].tags).toEqual(['typescript']);
    expect(result.meta).toEqual(mockPaginationMeta);
  });

  it('filters by status, search, and authorId', async () => {
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(blogRepository.findPosts).mockResolvedValue([]);
    vi.mocked(blogRepository.countPosts).mockResolvedValue(0);

    await blogService.listPosts({ status: 'DRAFT', search: 'test', authorId: 'user-1' });

    expect(blogRepository.findPosts).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      skip: 0,
      status: 'DRAFT',
      search: 'test',
      authorId: 'user-1',
    });
    expect(blogRepository.countPosts).toHaveBeenCalledWith({
      status: 'DRAFT',
      search: 'test',
      authorId: 'user-1',
    });
  });
});

describe('BlogService.getPost', () => {
  it('returns post by slug', async () => {
    vi.mocked(blogRepository.findPostBySlug).mockResolvedValue(mockPostRaw as any);

    const result = await blogService.getPost('test-post');

    expect(result.title).toBe('Test Post');
    expect(result.tags).toEqual(['typescript']);
  });

  it('throws NotFoundError for missing slug', async () => {
    vi.mocked(blogRepository.findPostBySlug).mockResolvedValue(null);

    await expect(blogService.getPost('missing')).rejects.toThrow(NotFoundError);
  });
});

describe('BlogService.createPost', () => {
  const createInput = {
    title: 'New Post',
    excerpt: 'Excerpt',
    content: 'Content',
    coverImage: 'https://example.com/img.jpg',
    status: 'PUBLISHED' as const,
    tags: ['typescript'],
  };

  it('creates post with generated slug', async () => {
    vi.mocked(generateSlug).mockReturnValue('new-post');
    vi.mocked(blogRepository.findPostBySlug).mockResolvedValue(null);
    vi.mocked(blogRepository.createPost).mockResolvedValue(mockPostRaw as any);

    const result = await blogService.createPost(mockUser, createInput);

    expect(generateSlug).toHaveBeenCalledWith('New Post');
    expect(blogRepository.createPost).toHaveBeenCalledWith({
      title: 'New Post',
      slug: 'new-post',
      excerpt: 'Excerpt',
      content: 'Content',
      coverImage: 'https://example.com/img.jpg',
      authorId: 'author-1',
      status: 'PUBLISHED',
      publishedAt: expect.any(Date),
      tags: ['typescript'],
    });
    expect(result.tags).toEqual(['typescript']);
  });

  it('creates unique slug if slug exists', async () => {
    vi.mocked(generateSlug).mockReturnValue('new-post');
    vi.mocked(blogRepository.findPostBySlug)
      .mockResolvedValueOnce(mockPostRaw as any)
      .mockResolvedValueOnce(null);
    vi.mocked(makeUniqueSlug).mockReturnValue('new-post-a1b2c3');
    vi.mocked(blogRepository.createPost).mockResolvedValue(mockPostRaw as any);

    await blogService.createPost(mockUser, createInput);

    expect(makeUniqueSlug).toHaveBeenCalledWith('new-post');
    expect(blogRepository.createPost).toHaveBeenCalledWith(expect.objectContaining({ slug: 'new-post-a1b2c3' }));
  });

  it('sets publishedAt for PUBLISHED status', async () => {
    vi.mocked(generateSlug).mockReturnValue('new-post');
    vi.mocked(blogRepository.findPostBySlug).mockResolvedValue(null);
    vi.mocked(blogRepository.createPost).mockResolvedValue(mockPostRaw as any);

    await blogService.createPost(mockUser, { ...createInput, status: 'DRAFT' });

    expect(blogRepository.createPost).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'DRAFT', publishedAt: null }),
    );
  });

  it('handles undefined optional fields', async () => {
    vi.mocked(generateSlug).mockReturnValue('minimal');
    vi.mocked(blogRepository.findPostBySlug).mockResolvedValue(null);
    vi.mocked(blogRepository.createPost).mockResolvedValue({
      ...mockPostRaw,
      slug: 'minimal',
      tags: [],
    } as any);

    await blogService.createPost(mockUser, { title: 'Minimal' });

    expect(blogRepository.createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        excerpt: null,
        content: null,
        coverImage: null,
        status: 'DRAFT',
        tags: undefined,
      }),
    );
  });
});

describe('BlogService.updatePost', () => {
  const updateInput = {
    title: 'Updated Title',
    status: 'PUBLISHED' as const,
    tags: ['updated'],
  };

  it('updates post fields', async () => {
    vi.mocked(blogRepository.findPostById).mockResolvedValue(mockPostRawDraft as any);
    vi.mocked(blogRepository.updatePost).mockResolvedValue(mockPostRaw as any);

    const result = await blogService.updatePost('post-2', mockUser, updateInput);

    expect(blogRepository.findPostById).toHaveBeenCalledWith('post-2');
    expect(blogRepository.updatePost).toHaveBeenCalledWith('post-2', {
      title: 'Updated Title',
      status: 'PUBLISHED',
      publishedAt: expect.any(Date),
      tags: ['updated'],
    });
    expect(result.tags).toEqual(['typescript']);
  });

  it('does not set publishedAt if already published', async () => {
    vi.mocked(blogRepository.findPostById).mockResolvedValue(mockPostRaw as any);
    vi.mocked(blogRepository.updatePost).mockResolvedValue(mockPostRaw as any);

    await blogService.updatePost('post-1', mockUser, { status: 'PUBLISHED' });

    expect(blogRepository.updatePost).toHaveBeenCalledWith('post-1', {
      status: 'PUBLISHED',
    });
  });

  it('throws NotFoundError for missing post', async () => {
    vi.mocked(blogRepository.findPostById).mockResolvedValue(null);

    await expect(blogService.updatePost('missing', mockUser, updateInput)).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError if not author and not admin', async () => {
    const otherUser = { id: 'other-user', role: 'USER' };
    vi.mocked(blogRepository.findPostById).mockResolvedValue(mockPostRaw as any);

    await expect(blogService.updatePost('post-1', otherUser, updateInput)).rejects.toThrow(ForbiddenError);
  });

  it('allows admin to update any post', async () => {
    vi.mocked(blogRepository.findPostById).mockResolvedValue(mockPostRaw as any);
    vi.mocked(blogRepository.updatePost).mockResolvedValue(mockPostRaw as any);

    const result = await blogService.updatePost('post-1', mockAdmin, { title: 'Admin Update' });

    expect(result.title).toBe('Test Post');
    expect(blogRepository.updatePost).toHaveBeenCalled();
  });

  it('only includes defined fields in update data', async () => {
    vi.mocked(blogRepository.findPostById).mockResolvedValue(mockPostRaw as any);
    vi.mocked(blogRepository.updatePost).mockResolvedValue(mockPostRaw as any);

    await blogService.updatePost('post-1', mockUser, { title: 'Only Title' });

    expect(blogRepository.updatePost).toHaveBeenCalledWith('post-1', { title: 'Only Title' });
  });
});

describe('BlogService.deletePost', () => {
  it('deletes post', async () => {
    vi.mocked(blogRepository.findPostById).mockResolvedValue(mockPostRaw as any);
    vi.mocked(blogRepository.deletePost).mockResolvedValue(mockPostRaw as any);

    await blogService.deletePost('post-1', mockUser);

    expect(blogRepository.deletePost).toHaveBeenCalledWith('post-1');
  });

  it('throws NotFoundError for missing post', async () => {
    vi.mocked(blogRepository.findPostById).mockResolvedValue(null);

    await expect(blogService.deletePost('missing', mockUser)).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError if not author and not admin', async () => {
    const otherUser = { id: 'other-user', role: 'USER' };
    vi.mocked(blogRepository.findPostById).mockResolvedValue(mockPostRaw as any);

    await expect(blogService.deletePost('post-1', otherUser)).rejects.toThrow(ForbiddenError);
  });

  it('allows admin to delete any post', async () => {
    vi.mocked(blogRepository.findPostById).mockResolvedValue(mockPostRaw as any);
    vi.mocked(blogRepository.deletePost).mockResolvedValue(mockPostRaw as any);

    await blogService.deletePost('post-1', mockAdmin);

    expect(blogRepository.deletePost).toHaveBeenCalledWith('post-1');
  });
});

describe('BlogService.formatPost', () => {
  it('correctly formats post with author and tags', async () => {
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(blogRepository.findPosts).mockResolvedValue([mockPostRaw] as any);
    vi.mocked(blogRepository.countPosts).mockResolvedValue(1);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    const result = await blogService.listPosts({});

    const post = result.posts[0];
    expect(post).not.toHaveProperty('authorId');
    expect(post).not.toHaveProperty('seoTitle');
    expect(post).not.toHaveProperty('seoDescription');
    expect(post).not.toHaveProperty('canonicalUrl');
    expect(post.author).toEqual(mockAuthor);
    expect(post.tags).toEqual(['typescript']);
  });

  it('handles posts with no tags', async () => {
    const postWithNoTags = { ...mockPostRaw, tags: [] };
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(blogRepository.findPosts).mockResolvedValue([postWithNoTags] as any);
    vi.mocked(blogRepository.countPosts).mockResolvedValue(1);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    const result = await blogService.listPosts({});

    expect(result.posts[0].tags).toEqual([]);
  });
});
