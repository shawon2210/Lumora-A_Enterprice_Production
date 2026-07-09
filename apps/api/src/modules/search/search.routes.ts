import { Router } from 'express';
import { searchController } from './search.controller';

const router = Router();

/**
 * @openapi
 * /search:
 *   get:
 *     tags: [Search]
 *     summary: Search across posts, users, and media
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         description: Search term (minimum 2 characters)
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/', searchController.search);

export default router;