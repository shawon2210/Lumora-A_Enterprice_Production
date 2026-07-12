/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mediaService } from '@/modules/media/media.service';
import { mediaRepository } from '@/modules/media/media.repository';
import { getPaginationParams, buildPaginationMeta } from '@/utils/pagination';
import { cloudinaryService } from '@/utils/cloudinary';
import { NotFoundError, ForbiddenError } from '@/utils/errors';

vi.mock('@/modules/media/media.repository');
vi.mock('@/utils/pagination');
vi.mock('@/utils/cloudinary');

const mockMediaItem = {
  id: 'media-1',
  url: 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg',
  type: 'IMAGE',
  name: 'photo.jpg',
  size: 102400,
  mimeType: 'image/jpeg',
  userId: 'user-1',
  width: 800,
  height: 600,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
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

beforeEach(() => {
  vi.resetAllMocks();
});

describe('mediaService.listMedia', () => {
  it('returns paginated media', async () => {
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(mediaRepository.findMedia).mockResolvedValue([mockMediaItem] as any);
    vi.mocked(mediaRepository.countMedia).mockResolvedValue(1);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    const result = await mediaService.listMedia('user-1', {});

    expect(result.media).toHaveLength(1);
    expect(result.media[0].name).toBe('photo.jpg');
    expect(result.meta).toEqual(mockPaginationMeta);
  });

  it('filters by type and search', async () => {
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(mediaRepository.findMedia).mockResolvedValue([]);
    vi.mocked(mediaRepository.countMedia).mockResolvedValue(0);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    await mediaService.listMedia('user-1', { type: 'IMAGE', search: 'photo' });

    expect(mediaRepository.findMedia).toHaveBeenCalledWith({
      userId: 'user-1',
      skip: 0,
      limit: 20,
      type: 'IMAGE',
      search: 'photo',
    });
    expect(mediaRepository.countMedia).toHaveBeenCalledWith({
      userId: 'user-1',
      type: 'IMAGE',
      search: 'photo',
    });
  });
});

describe('mediaService.uploadMedia', () => {
  const mockFile = {
    originalname: 'photo.jpg',
    mimetype: 'image/jpeg',
    size: 102400,
    buffer: Buffer.from('test'),
  } as Express.Multer.File;

  it('uploads to cloudinary and creates media record', async () => {
    vi.mocked(cloudinaryService.upload).mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg',
      publicId: 'test-public-id',
    });
    vi.mocked(mediaRepository.createMedia).mockResolvedValue(mockMediaItem as any);

    const result = await mediaService.uploadMedia('user-1', mockFile);

    expect(cloudinaryService.upload).toHaveBeenCalledWith(mockFile);
    expect(mediaRepository.createMedia).toHaveBeenCalledWith({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg',
      type: 'IMAGE',
      name: 'photo.jpg',
      size: 102400,
      mimeType: 'image/jpeg',
      userId: 'user-1',
    });
    expect(result.id).toBe('media-1');
  });

  it('determines correct media type from mime type', async () => {
    vi.mocked(cloudinaryService.upload).mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/video.mp4',
      publicId: 'vid',
    });
    vi.mocked(mediaRepository.createMedia).mockResolvedValue(mockMediaItem as any);

    const videoFile = { ...mockFile, mimetype: 'video/mp4', originalname: 'video.mp4' } as Express.Multer.File;
    await mediaService.uploadMedia('user-1', videoFile);

    expect(mediaRepository.createMedia).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'VIDEO', name: 'video.mp4' }),
    );
  });

  it('returns DOCUMENT for unknown mime types', async () => {
    vi.mocked(cloudinaryService.upload).mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/file.pdf',
      publicId: 'pdf',
    });
    vi.mocked(mediaRepository.createMedia).mockResolvedValue(mockMediaItem as any);

    const pdfFile = { ...mockFile, mimetype: 'application/pdf', originalname: 'doc.pdf' } as Express.Multer.File;
    await mediaService.uploadMedia('user-1', pdfFile);

    expect(mediaRepository.createMedia).toHaveBeenCalledWith(expect.objectContaining({ type: 'DOCUMENT' }));
  });

  it('returns AUDIO for audio mime types', async () => {
    vi.mocked(cloudinaryService.upload).mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/audio.mp3',
      publicId: 'audio',
    });
    vi.mocked(mediaRepository.createMedia).mockResolvedValue(mockMediaItem as any);

    const audioFile = { ...mockFile, mimetype: 'audio/mpeg', originalname: 'song.mp3' } as Express.Multer.File;
    await mediaService.uploadMedia('user-1', audioFile);

    expect(mediaRepository.createMedia).toHaveBeenCalledWith(expect.objectContaining({ type: 'AUDIO' }));
  });
});

describe('mediaService.deleteMedia', () => {
  it('deletes media owned by user', async () => {
    vi.mocked(mediaRepository.findMediaById).mockResolvedValue(mockMediaItem as any);
    vi.mocked(mediaRepository.deleteMedia).mockResolvedValue(mockMediaItem as any);

    await mediaService.deleteMedia('media-1', 'user-1');

    expect(mediaRepository.findMediaById).toHaveBeenCalledWith('media-1');
    expect(mediaRepository.deleteMedia).toHaveBeenCalledWith('media-1');
  });

  it('throws NotFoundError for missing media', async () => {
    vi.mocked(mediaRepository.findMediaById).mockResolvedValue(null);

    await expect(mediaService.deleteMedia('missing', 'user-1')).rejects.toThrow(NotFoundError);
    expect(mediaRepository.deleteMedia).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError for other users media', async () => {
    vi.mocked(mediaRepository.findMediaById).mockResolvedValue(mockMediaItem as any);

    await expect(mediaService.deleteMedia('media-1', 'other-user')).rejects.toThrow(ForbiddenError);
    expect(mediaRepository.deleteMedia).not.toHaveBeenCalled();
  });
});
