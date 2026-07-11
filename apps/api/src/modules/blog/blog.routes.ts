import { Router } from 'express';
import { listPosts, getPost, getPostById, createPost, updatePost, deletePost } from './blog.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { auditLog } from '@/middleware/audit';
import { createPostSchema, updatePostSchema, paginationSchema, paramsSchema } from '@lumora/validators';

const router = Router();

/**
 * @openapi
 * /blog/posts:
 *   get:
 *     tags: [Blog]
 *     summary: List blog posts with pagination
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *         description: Filter by author
 *     responses:
 *       200:
 *         description: Paginated list of blog posts
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BlogPost'
 *                     meta:
 *                       $ref: '#/components/schemas/ApiResponse/properties/meta'
 */
router.get('/posts', validate({ query: paginationSchema }), listPosts);

/**
 * @openapi
 * /blog/posts/{slug}:
 *   get:
 *     tags: [Blog]
 *     summary: Get a blog post by slug
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Post slug
 *     responses:
 *       200:
 *         description: Blog post details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BlogPost'
 *       404:
 *         description: Blog post not found
 */
router.get('/posts/id/:id', validate({ params: paramsSchema }), getPostById);
router.get('/posts/:slug', getPost);

/**
 * @openapi
 * /blog/posts:
 *   post:
 *     tags: [Blog]
 *     summary: Create a new blog post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, excerpt, content]
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: uri
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED]
 *                 default: DRAFT
 *     responses:
 *       201:
 *         description: Blog post created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BlogPost'
 */
router.post('/posts', authenticate, validate({ body: createPostSchema }), auditLog('CREATE', 'BlogPost'), createPost);

/**
 * @openapi
 * /blog/posts/{id}:
 *   put:
 *     tags: [Blog]
 *     summary: Update a blog post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: uri
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Blog post updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BlogPost'
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Blog post not found
 */
router.put(
  '/posts/:id',
  authenticate,
  validate({ body: updatePostSchema, params: paramsSchema }),
  auditLog('UPDATE', 'BlogPost'),
  updatePost,
);

/**
 * @openapi
 * /blog/posts/{id}:
 *   delete:
 *     tags: [Blog]
 *     summary: Delete a blog post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Blog post deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Blog post not found
 */
router.delete(
  '/posts/:id',
  authenticate,
  validate({ params: paramsSchema }),
  auditLog('DELETE', 'BlogPost'),
  deletePost,
);

export default router;
