import type { Response } from 'express';
import type { PaginationMeta } from '@lumora/shared';

export function sendSuccess<T>(res: Response, data: T, meta?: PaginationMeta, status = 200) {
  return res.status(status).json({ success: true, data, meta });
}

export function sendPaginated<T>(res: Response, data: T[], meta: PaginationMeta) {
  return res.status(200).json({ success: true, data, meta });
}

export function sendMessage(res: Response, message: string, status = 200) {
  return res.status(status).json({ success: true, message });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  status = 400,
  details?: Record<string, string[]>,
) {
  return res.status(status).json({ success: false, error: { code, message, details } });
}
