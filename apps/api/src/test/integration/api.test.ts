import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: vi.fn(),
  signAccessToken: vi.fn(() => 'mock-access-token'),
  signRefreshToken: vi.fn(() => 'mock-refresh-token'),
  verifyRefreshToken: vi.fn(),
}));

vi.mock('@/utils/password', () => ({
  hashPassword: vi.fn(() => Promise.resolve('hashed-password')),
  comparePassword: vi.fn(),
}));

vi.mock('@/utils/crypto', () => ({
  generateToken: vi.fn(() => 'reset-token-123'),
}));

vi.mock('@/utils/email', () => ({
  sendPasswordResetEmail: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@/utils/cloudinary', () => ({
  cloudinaryService: {
    upload: vi.fn(() => Promise.resolve({ url: 'https://example.com/uploaded.jpg', publicId: 'test-public-id' })),
    delete: vi.fn(() => Promise.resolve(true)),
  },
}));

vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('@/config/swagger', () => ({
  swaggerSpec: { openapi: '3.0.0', info: { title: 'Lumora Test API' } },
}));

vi.mock('@/config/passport', () => ({
  configurePassport: vi.fn(),
}));

vi.mock('passport', () => {
  const passThrough = (_req: any, _res: any, next: any) => next();
  return {
    default: {
      initialize: vi.fn(() => passThrough),
      authenticate: vi.fn(() => passThrough),
      use: vi.fn(),
      serializeUser: vi.fn(),
      deserializeUser: vi.fn(),
    },
  };
});

vi.mock('swagger-ui-express', () => ({
  default: {
    serve: [],
    setup: vi.fn(() => (_req: any, _res: any, next: any) => next()),
  },
}));

vi.mock('swagger-jsdoc', () => ({
  default: vi.fn(() => ({ openapi: '3.0.0', info: { title: 'Test' } })),
}));

const { mockPrisma } = vi.hoisted(() => {
  const m = {
    user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    session: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    blogPost: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    blogTag: { findUnique: vi.fn(), upsert: vi.fn() },
    blogPostTag: { deleteMany: vi.fn(), create: vi.fn() },
    media: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    notification: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
    passwordResetToken: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    account: { findUnique: vi.fn(), create: vi.fn() },
    auditLog: { findMany: vi.fn(), count: vi.fn(), create: vi.fn(() => Promise.resolve({})) },
    emailVerificationToken: { create: vi.fn() },
    $transaction: vi.fn((cb: any) => cb(m)),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
  return { mockPrisma: m };
});

vi.mock('@lumora/database', () => ({ prisma: mockPrisma }));

import app from '@/app';
import { verifyAccessToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { comparePassword } from '@/utils/password';

const _verifyAccessToken = vi.mocked(verifyAccessToken);
const _signAccessToken = vi.mocked(signAccessToken);
const _signRefreshToken = vi.mocked(signRefreshToken);
const _verifyRefreshToken = vi.mocked(verifyRefreshToken);
const _comparePassword = vi.mocked(comparePassword);

const fakeToken = 'valid.jwt.token';
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  role: 'USER',
  subscription: 'FREE',
  emailVerified: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
const mockAdmin = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
  avatar: null,
  role: 'ADMIN',
  subscription: 'PRO',
  emailVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
const mockPost = {
  id: 'post-1',
  title: 'Test Post',
  slug: 'test-post',
  excerpt: 'Test excerpt',
  content: 'Test content',
  coverImage: null,
  authorId: 'user-1',
  status: 'PUBLISHED',
  publishedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  seoTitle: null,
  seoDescription: null,
  canonicalUrl: null,
  author: { id: 'user-1', name: 'Test User', avatar: null },
  tags: [],
};
const mockMedia = {
  id: 'media-1',
  url: 'https://example.com/image.jpg',
  type: 'IMAGE',
  name: 'test.jpg',
  size: 1024,
  mimeType: 'image/jpeg',
  userId: 'user-1',
  fileId: null,
  folder: null,
  createdAt: new Date('2024-01-01'),
};
const mockNotification = {
  id: 'notif-1',
  type: 'INFO',
  title: 'Test Notification',
  message: 'Test message',
  read: false,
  userId: 'user-1',
  createdAt: new Date('2024-01-01'),
};

function setupAuth(user = mockUser) {
  _verifyAccessToken.mockReturnValue({ sub: user.id, role: user.role });
  mockPrisma.user.findUnique.mockResolvedValue(user);
}

function setupAdminAuth() {
  setupAuth(mockAdmin);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockPrisma));
  mockPrisma.auditLog.create.mockResolvedValue({});
  _signAccessToken.mockReturnValue('mock-access-token');
  _signRefreshToken.mockReturnValue('mock-refresh-token');
});

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('1) should register a new user (201)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.session.create.mockResolvedValue({ id: 'session-1', user: mockUser });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'TestPass1', name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('mock-access-token');
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('2) should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: 'TestPass1', name: 'Test User' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('3) should return 422 for short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'Ab1', name: 'Test User' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('4) should return 409 for existing email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'TestPass1', name: 'Test User' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('5) should login successfully (200)', async () => {
      const loginUser = { ...mockUser, password: 'hashed-password' };
      mockPrisma.user.findUnique.mockResolvedValue(loginUser);
      _comparePassword.mockResolvedValue(true);
      mockPrisma.session.create.mockResolvedValue({ id: 'session-1', user: loginUser });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'TestPass1' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('mock-access-token');
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('6) should return 422 for missing fields', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@example.com' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('7) should return 401 for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      _comparePassword.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'WrongPass1' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('8) should logout successfully (200)', async () => {
      _verifyAccessToken.mockReturnValue({ sub: 'user-1', role: 'USER' });
      mockPrisma.session.delete.mockResolvedValue({});

      const res = await request(app).post('/api/v1/auth/logout').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('9) should refresh token (200)', async () => {
      _verifyRefreshToken.mockReturnValue({ sub: 'user-1', role: 'USER' });
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'session-1',
        token: 'old-token',
        refreshToken: 'old-refresh',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 86400000),
        user: mockUser,
      });
      mockPrisma.session.delete.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({ id: 'session-2', user: mockUser });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: 'old-refresh' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('mock-access-token');
    });

    it('10) should return 401 for missing token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({});

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('11) should send reset email (200)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.passwordResetToken.create.mockResolvedValue({});

      const res = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('12) should return 422 for invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'bad-email' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('13) should reset password (200)', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt-1',
        email: 'test@example.com',
        token: 'valid-token',
        used: false,
        expiresAt: new Date(Date.now() + 86400000),
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.passwordResetToken.update.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'valid-token', password: 'NewPass1!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password reset successfully');
    });

    it('14) should return 401 for invalid token', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'bad-token', password: 'NewPass1!' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('15) should return user (200)', async () => {
      setupAuth();
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('16) should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});

describe('Blog Endpoints', () => {
  describe('GET /api/v1/blog/posts', () => {
    it('17) should return paginated posts (200)', async () => {
      mockPrisma.blogPost.findMany.mockResolvedValue([mockPost]);
      mockPrisma.blogPost.count.mockResolvedValue(1);

      const res = await request(app).get('/api/v1/blog/posts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.total).toBe(1);
    });
  });

  describe('GET /api/v1/blog/posts/:slug', () => {
    it('18) should return post by slug (200)', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(mockPost);

      const res = await request(app).get('/api/v1/blog/posts/test-post');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('test-post');
    });

    it('19) should return 404 for non-existent slug', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/blog/posts/non-existent');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/blog/posts', () => {
    it('20) should create a post (201)', async () => {
      setupAuth();
      mockPrisma.blogPost.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockPrisma));
      const createdPost = {
        ...mockPost,
        id: 'new-post-1',
        slug: 'test-post',
        authorId: 'user-1',
        status: 'DRAFT',
        tags: [],
        author: { id: 'user-1', name: 'Test User', avatar: null },
        seoTitle: null,
        seoDescription: null,
        canonicalUrl: null,
      };
      mockPrisma.blogPost.create.mockResolvedValue(createdPost);

      const res = await request(app)
        .post('/api/v1/blog/posts')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({ title: 'Test Post', excerpt: 'Test excerpt', content: 'Test content' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Post');
    });

    it('21) should return 401 without auth', async () => {
      const res = await request(app)
        .post('/api/v1/blog/posts')
        .send({ title: 'Test Post', excerpt: 'Test excerpt', content: 'Test content' });

      expect(res.status).toBe(401);
    });

    it('22) should return 422 for missing required fields', async () => {
      setupAuth();
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).post('/api/v1/blog/posts').set('Authorization', `Bearer ${fakeToken}`).send({});

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/v1/blog/posts/:id', () => {
    it('23) should update a post (200)', async () => {
      setupAuth();
      mockPrisma.blogPost.findUnique.mockResolvedValue(mockPost);
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockPrisma));
      mockPrisma.blogPost.update.mockResolvedValue(mockPost);

      const res = await request(app)
        .put('/api/v1/blog/posts/post-1')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('24) should return 403 if not the author', async () => {
      setupAuth();
      const otherPost = { ...mockPost, authorId: 'other-user' };
      mockPrisma.blogPost.findUnique.mockResolvedValue(otherPost);

      const res = await request(app)
        .put('/api/v1/blog/posts/post-1')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/v1/blog/posts/:id', () => {
    it('25) should delete a post (200)', async () => {
      setupAuth();
      mockPrisma.blogPost.findUnique.mockResolvedValue(mockPost);
      mockPrisma.blogPost.delete.mockResolvedValue(mockPost);

      const res = await request(app).delete('/api/v1/blog/posts/post-1').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('26) should return 404 for non-existent post', async () => {
      setupAuth();
      mockPrisma.blogPost.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/v1/blog/posts/non-existent')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});

describe('Media Endpoints', () => {
  describe('GET /api/v1/media', () => {
    it('27) should return paginated media (200)', async () => {
      setupAuth();
      mockPrisma.media.findMany.mockResolvedValue([mockMedia]);
      mockPrisma.media.count.mockResolvedValue(1);

      const res = await request(app).get('/api/v1/media').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('28) should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/media');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/media/upload', () => {
    it('29) should upload media (201)', async () => {
      setupAuth();
      mockPrisma.media.create.mockResolvedValue(mockMedia);

      const res = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', `Bearer ${fakeToken}`)
        .attach('file', Buffer.from('fake-image'), 'test.jpg');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('30) should return 401 without auth', async () => {
      const res = await request(app).post('/api/v1/media/upload').attach('file', Buffer.from('fake-image'), 'test.jpg');

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/media/:id', () => {
    it('31) should delete media (200)', async () => {
      setupAuth();
      mockPrisma.media.findUnique.mockResolvedValue(mockMedia);
      mockPrisma.media.delete.mockResolvedValue(mockMedia);

      const res = await request(app).delete('/api/v1/media/media-1').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('32) should return 401 without auth', async () => {
      const res = await request(app).delete('/api/v1/media/media-1');

      expect(res.status).toBe(401);
    });

    it('33) should return 404 for non-existent media', async () => {
      setupAuth();
      mockPrisma.media.findUnique.mockResolvedValue(null);

      const res = await request(app).delete('/api/v1/media/non-existent').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});

describe('Admin Endpoints', () => {
  describe('Authentication & RBAC', () => {
    it('34a) should return 401 for unauthenticated admin', async () => {
      const res = await request(app).get('/api/v1/admin/users');

      expect(res.status).toBe(401);
    });

    it('34b) should return 403 for non-admin user', async () => {
      setupAuth();
      const res = await request(app).get('/api/v1/admin/users').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('35) should list users (200)', async () => {
      setupAdminAuth();
      mockPrisma.user.findMany.mockResolvedValue([mockAdmin]);
      mockPrisma.user.count.mockResolvedValue(1);

      const res = await request(app).get('/api/v1/admin/users').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.meta).toBeDefined();
    });
  });

  describe('GET /api/v1/admin/users/:id', () => {
    it('36) should get user by id (200)', async () => {
      setupAdminAuth();
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdmin).mockResolvedValueOnce(mockUser);

      const res = await request(app).get('/api/v1/admin/users/user-1').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/admin/users/:id', () => {
    it('37) should update user role (200)', async () => {
      setupAdminAuth();
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdmin).mockResolvedValueOnce(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, role: 'MODERATOR' });

      const res = await request(app)
        .put('/api/v1/admin/users/user-1')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({ role: 'MODERATOR' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/admin/users/:id', () => {
    it('38) should delete user (200)', async () => {
      setupAdminAuth();
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockAdmin).mockResolvedValueOnce(mockUser);
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      const res = await request(app).delete('/api/v1/admin/users/user-1').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/analytics', () => {
    it('39) should get analytics (200)', async () => {
      setupAdminAuth();
      mockPrisma.user.count.mockResolvedValue(10);
      mockPrisma.blogPost.count.mockResolvedValue(25);
      mockPrisma.media.count.mockResolvedValue(50);
      mockPrisma.session.count.mockResolvedValue(5);

      const res = await request(app).get('/api/v1/admin/analytics').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/logs', () => {
    it('40) should list audit logs (200)', async () => {
      setupAdminAuth();
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      const res = await request(app).get('/api/v1/admin/logs').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Notification Endpoints', () => {
  describe('GET /api/v1/user/notifications', () => {
    it('41) should list notifications (200)', async () => {
      setupAuth();
      mockPrisma.notification.findMany.mockResolvedValue([mockNotification]);
      mockPrisma.notification.count.mockResolvedValue(1);

      const res = await request(app).get('/api/v1/user/notifications').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/user/notifications/unread', () => {
    it('42) should get unread count (200)', async () => {
      setupAuth();
      mockPrisma.notification.count.mockResolvedValue(3);

      const res = await request(app)
        .get('/api/v1/user/notifications/unread')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(3);
    });
  });

  describe('PUT /api/v1/user/notifications/:id/read', () => {
    it('43) should mark notification as read (200)', async () => {
      setupAuth();
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);
      mockPrisma.notification.update.mockResolvedValue({ ...mockNotification, read: true });

      const res = await request(app)
        .put('/api/v1/user/notifications/notif-1/read')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/user/notifications/read-all', () => {
    it('44) should mark all as read (200)', async () => {
      setupAuth();
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const res = await request(app)
        .put('/api/v1/user/notifications/read-all')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('User Endpoints', () => {
  describe('GET /api/v1/user/profile', () => {
    it('45) should get profile (200)', async () => {
      setupAuth();
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app).get('/api/v1/user/profile').set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });
  });

  describe('PUT /api/v1/user/profile', () => {
    it('46) should update profile (200)', async () => {
      setupAuth();
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, name: 'Updated Name' });

      const res = await request(app)
        .put('/api/v1/user/profile')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('Search Endpoint', () => {
  describe('GET /api/v1/search', () => {
    it('47) should search and return results (200)', async () => {
      mockPrisma.blogPost.findMany.mockResolvedValue([mockPost]);
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.media.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/v1/search?q=test');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('48) should return empty results for short query (200)', async () => {
      const res = await request(app).get('/api/v1/search?q=x');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });
});

describe('Health Endpoint', () => {
  describe('GET /api/v1/health', () => {
    it('49) should return health status (200)', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
      expect(res.body.data.timestamp).toBeDefined();
    });
  });
});

describe('Swagger Endpoint', () => {
  describe('GET /api-docs.json', () => {
    it('50) should return swagger spec (200)', async () => {
      const res = await request(app).get('/api-docs.json');

      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.0');
    });
  });
});
