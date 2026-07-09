import { prisma } from '@lumora/database';
import type { Prisma } from '@prisma/client';
import type { BlogPostStatus } from '@prisma/client';

interface FindPostsParams {
  page: number;
  limit: number;
  skip: number;
  status?: string;
  search?: string;
  authorId?: string;
}

interface CreatePostData {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  authorId: string;
  status: string;
  publishedAt: Date | null;
  tags?: string[];
}

interface UpdatePostData {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  status?: string;
  publishedAt?: Date | null;
  tags?: string[];
}

const postInclude: Prisma.BlogPostInclude = {
  author: { select: { id: true, name: true, avatar: true, role: true } },
  tags: {
    include: { tag: { select: { name: true } } },
  },
};

function buildWhere(params: {
  status?: string;
  search?: string;
  authorId?: string;
}): Prisma.BlogPostWhereInput {
  const where: Prisma.BlogPostWhereInput = {};
  if (params.status)
    where.status = params.status as BlogPostStatus;
  if (params.search) where.title = { contains: params.search, mode: 'insensitive' };
  if (params.authorId) where.authorId = params.authorId;
  return where;
}

function tagSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 200) || 'untitled'
  );
}

export class BlogRepository {
  findPosts(params: FindPostsParams) {
    return prisma.blogPost.findMany({
      where: buildWhere(params),
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.limit,
    });
  }

  countPosts(params: { status?: string; search?: string; authorId?: string }) {
    return prisma.blogPost.count({ where: buildWhere(params) });
  }

  findPostBySlug(slug: string) {
    return prisma.blogPost.findUnique({
      where: { slug },
      include: postInclude,
    });
  }

  findPostById(id: string) {
    return prisma.blogPost.findUnique({
      where: { id },
      include: postInclude,
    });
  }

  async createPost(data: CreatePostData) {
    const { tags, ...postData } = data;

    return prisma.$transaction(async (tx) => {
      const tagRecords =
        tags && tags.length > 0
          ? await Promise.all(
              tags.map(async (name) =>
                tx.blogTag.upsert({
                  where: { slug: tagSlug(name) },
                  update: {},
                  create: { name, slug: tagSlug(name) },
                }),
              ),
            )
          : [];

      return tx.blogPost.create({
        data: {
          ...postData,
          status: postData.status as BlogPostStatus,
          tags: {
            create: tagRecords.map((tag) => ({
              tag: { connect: { id: tag.id } },
            })),
          },
        },
        include: postInclude,
      });
    });
  }

  async updatePost(id: string, data: UpdatePostData) {
    const { tags, ...postData } = data;

    return prisma.$transaction(async (tx) => {
      if (tags !== undefined) {
        await tx.blogPostTag.deleteMany({ where: { blogPostId: id } });

        if (tags.length > 0) {
          const tagRecords = await Promise.all(
            tags.map(async (name) =>
              tx.blogTag.upsert({
                where: { slug: tagSlug(name) },
                update: {},
                create: { name, slug: tagSlug(name) },
              }),
            ),
          );

          await Promise.all(
            tagRecords.map((tag) =>
              tx.blogPostTag.create({
                data: { blogPostId: id, tagId: tag.id },
              }),
            ),
          );
        }
      }

      const updateInput: any = { ...postData };
      if (postData.status) {
        updateInput.status = postData.status as BlogPostStatus;
      }

      return tx.blogPost.update({
        where: { id },
        data: updateInput,
        include: postInclude,
      });
    });
  }

  deletePost(id: string) {
    return prisma.blogPost.delete({ where: { id } });
  }

  findOrCreateTag(name: string) {
    return prisma.blogTag.upsert({
      where: { slug: tagSlug(name) },
      update: {},
      create: { name, slug: tagSlug(name) },
    });
  }
}

export const blogRepository = new BlogRepository();