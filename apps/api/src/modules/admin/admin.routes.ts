import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '@/middleware/auth';
import { requireAdmin } from '@/middleware/rbac';
import { validate } from '@/middleware/validate';
import { paramsSchema, updateUserRoleSchema } from '@lumora/validators';

const router = Router();

router.use(authenticate, requireAdmin);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [USER, ADMIN, MODERATOR] }
 *     responses:
 *       200:
 *         description: Paginated user list
 */
router.get('/users', adminController.listUsers);

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/users/:id', validate({ params: paramsSchema }), adminController.getUser);

/**
 * @openapi
 * /admin/users/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update user role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN, MODERATOR]
 *     responses:
 *       200:
 *         description: User updated
 */
router.put(
  '/users/:id',
  validate({ params: paramsSchema, body: updateUserRoleSchema }),
  adminController.updateUserRole,
);

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/users/:id', validate({ params: paramsSchema }), adminController.deleteUser);

/**
 * @openapi
 * /admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Get analytics data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/analytics', adminController.getAnalytics);

/**
 * @openapi
 * /admin/logs:
 *   get:
 *     tags: [Admin]
 *     summary: List audit logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: severity
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated audit logs
 */
router.get('/logs', adminController.listAuditLogs);

export default router;