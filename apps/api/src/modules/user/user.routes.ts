import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { updateProfileSchema } from '@lumora/validators';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /user/profile:
 *   get:
 *     tags: [User]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', userController.getProfile);

/**
 * @openapi
 * /user/profile:
 *   put:
 *     tags: [User]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', validate({ body: updateProfileSchema }), userController.updateProfile);

export default router;