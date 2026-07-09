import type { Request, Response, NextFunction } from 'express';
import { searchService } from './search.service';

export const searchController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || '';
      const results = await searchService.search(q);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  },
};
