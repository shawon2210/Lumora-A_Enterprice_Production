import { Router } from 'express';
import multer from 'multer';
import { mediaController } from './media.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { paramsSchema } from '@lumora/validators';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const router = Router();

/**
 * @openapi
 * /media:
 *   get:
 *     tags: [Media]
 *     summary: List user media files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [IMAGE, VIDEO, AUDIO, DOCUMENT] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated media list
 */
router.get('/', authenticate, mediaController.listMedia);

/**
 * @openapi
 * /media/upload:
 *   post:
 *     tags: [Media]
 *     summary: Upload a media file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Media created
 */
router.post('/upload', authenticate, upload.single('file'), mediaController.upload);

/**
 * @openapi
 * /media/{id}:
 *   delete:
 *     tags: [Media]
 *     summary: Delete a media file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Media deleted
 */
router.delete('/:id', authenticate, validate({ params: paramsSchema }), mediaController.delete);

export default router;