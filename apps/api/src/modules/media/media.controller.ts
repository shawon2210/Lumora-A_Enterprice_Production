import type { Request, Response, NextFunction } from 'express';
import { mediaService } from './media.service';
import { sendSuccess } from '@/utils/response';

export const mediaController = {
  async listMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { media, meta } = await mediaService.listMedia(req.user!.id, req.query as any);
      sendSuccess(res, { media, meta });
    } catch (err) {
      next(err);
    }
  },

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await mediaService.uploadMedia(req.user!.id, req.file!);
      sendSuccess(res, media, undefined, 201);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await mediaService.deleteMedia(req.params.id as string, req.user!.id);
      sendSuccess(res, { message: 'Media deleted' });
    } catch (err) {
      next(err);
    }
  },
};
