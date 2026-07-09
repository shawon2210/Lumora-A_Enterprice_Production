import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res: Response, message: string, status = 400, code = 'BAD_REQUEST') {
  return res.status(status).json({ success: false, error: { code, message } });
}

export function sendPaginated<T>(res: Response, data: T[], total: number, page: number, limit: number) {
  return res.status(200).json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}
