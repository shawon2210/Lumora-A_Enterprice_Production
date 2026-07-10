import { prisma } from '@lumora/database';
import type { Prisma, MediaType } from '@prisma/client';

export const mediaRepository = {
  findMedia(params: { userId: string; skip: number; limit: number; type?: string; search?: string }) {
    const where: Prisma.MediaWhereInput = { userId: params.userId };
    if (params.type) where.type = params.type as MediaType;
    if (params.search) where.name = { contains: params.search, mode: 'insensitive' };
    return prisma.media.findMany({
      where,
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    });
  },

  countMedia(params: { userId: string; type?: string; search?: string }) {
    const where: Prisma.MediaWhereInput = { userId: params.userId };
    if (params.type) where.type = params.type as MediaType;
    if (params.search) where.name = { contains: params.search, mode: 'insensitive' };
    return prisma.media.count({ where });
  },

  findMediaById(id: string) {
    return prisma.media.findUnique({ where: { id } });
  },

  createMedia(data: {
    url: string;
    type: MediaType;
    name: string;
    size: number;
    mimeType: string;
    userId: string;
    width?: number;
    height?: number;
  }) {
    return prisma.media.create({
      data: {
        url: data.url,
        type: data.type,
        name: data.name,
        size: data.size,
        mimeType: data.mimeType,
        userId: data.userId,
        width: data.width,
        height: data.height,
      } as Prisma.MediaUncheckedCreateInput,
    });
  },

  deleteMedia(id: string) {
    return prisma.media.delete({ where: { id } });
  },
};
