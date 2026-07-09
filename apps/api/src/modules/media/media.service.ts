import { mediaRepository } from './media.repository';
import { getPaginationParams, buildPaginationMeta } from '@/utils/pagination';
import { NotFoundError, ForbiddenError } from '@/utils/errors';
import type { MediaType } from '@prisma/client';

function getMediaType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  return 'DOCUMENT';
}

export const mediaService = {
  async listMedia(userId: string, query: { page?: string; type?: string; search?: string }) {
    const { page, limit, skip } = getPaginationParams({
      page: query.page ? parseInt(query.page, 10) : undefined,
    });
    const [media, total] = await Promise.all([
      mediaRepository.findMedia({ userId, skip, limit, type: query.type, search: query.search }),
      mediaRepository.countMedia({ userId, type: query.type, search: query.search }),
    ]);
    return { media, meta: buildPaginationMeta(total, page, limit) };
  },

  async uploadMedia(userId: string, file: Express.Multer.File) {
    const type = getMediaType(file.mimetype) as MediaType;
    const url = `https://res.cloudinary.com/lumora/image/upload/v1/${userId}/${Date.now()}_${file.originalname}`;
    return mediaRepository.createMedia({
      url,
      type,
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      userId,
    });
  },

  async deleteMedia(id: string, userId: string) {
    const media = await mediaRepository.findMediaById(id);
    if (!media) throw new NotFoundError('Media');
    if (media.userId !== userId) throw new ForbiddenError("Cannot delete another user's media");
    await mediaRepository.deleteMedia(id);
  },
};
