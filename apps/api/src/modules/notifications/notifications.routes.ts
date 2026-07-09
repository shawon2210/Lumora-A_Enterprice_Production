import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { paramsSchema } from '@lumora/validators';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /user/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List user notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated notifications with unread count
 */
router.get('/', notificationsController.listNotifications);

/**
 * @openapi
 * /user/notifications/unread:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread', notificationsController.getUnreadCount);

/**
 * @openapi
 * /user/notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.put('/:id/read', validate({ params: paramsSchema }), notificationsController.markAsRead);

/**
 * @openapi
 * /user/notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All marked as read
 */
router.put('/read-all', notificationsController.markAllAsRead);

export default router;