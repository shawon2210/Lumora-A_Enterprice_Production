import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '@/modules/admin/admin.service';
import { adminRepository } from '@/modules/admin/admin.repository';
import { getPaginationParams, buildPaginationMeta } from '@/utils/pagination';
import { NotFoundError } from '@/utils/errors';

vi.mock('@/modules/admin/admin.repository');
vi.mock('@/utils/pagination');

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
  _count: { blogPosts: 2, sessions: 5 },
};

const mockAnalytics = {
  totalUsers: 100,
  totalPosts: 50,
  totalMedia: 30,
  activeUsers: 10,
  signupsToday: 3,
  revenue: 0,
};

const mockAuditLog = {
  id: 'log-1',
  action: 'USER_DELETED',
  entity: 'User',
  entityId: 'user-1',
  userId: 'admin-1',
  metadata: null,
  createdAt: new Date('2024-01-01'),
  user: { name: 'Admin', email: 'admin@example.com' },
};

const mockPaginationParams = { page: 1, limit: 20, skip: 0 };
const mockPaginationMeta = {
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('adminService.listUsers', () => {
  it('returns paginated users', async () => {
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(adminRepository.findUsers).mockResolvedValue([mockUser] as any);
    vi.mocked(adminRepository.countUsers).mockResolvedValue(1);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    const result = await adminService.listUsers({});

    expect(result.users).toHaveLength(1);
    expect(result.users[0].email).toBe('test@example.com');
    expect(result.meta).toEqual(mockPaginationMeta);
  });

  it('filters by search and role', async () => {
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(adminRepository.findUsers).mockResolvedValue([]);
    vi.mocked(adminRepository.countUsers).mockResolvedValue(0);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    await adminService.listUsers({ search: 'test', role: 'ADMIN' });

    expect(adminRepository.findUsers).toHaveBeenCalledWith({
      skip: 0,
      limit: 20,
      search: 'test',
      role: 'ADMIN',
    });
    expect(adminRepository.countUsers).toHaveBeenCalledWith({
      search: 'test',
      role: 'ADMIN',
    });
  });

  it('parses page and limit from query strings', async () => {
    vi.mocked(getPaginationParams).mockReturnValue({ page: 2, limit: 10, skip: 10 });
    vi.mocked(adminRepository.findUsers).mockResolvedValue([]);
    vi.mocked(adminRepository.countUsers).mockResolvedValue(0);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    await adminService.listUsers({ page: '2', limit: '10' });

    expect(getPaginationParams).toHaveBeenCalledWith({ page: 2, limit: 10 });
  });
});

describe('adminService.getUser', () => {
  it('returns user by id', async () => {
    vi.mocked(adminRepository.findUserById).mockResolvedValue(mockUser as any);

    const result = await adminService.getUser('user-1');

    expect(result.id).toBe('user-1');
    expect(adminRepository.findUserById).toHaveBeenCalledWith('user-1');
  });

  it('throws NotFoundError for missing user', async () => {
    vi.mocked(adminRepository.findUserById).mockResolvedValue(null);

    await expect(adminService.getUser('missing')).rejects.toThrow(NotFoundError);
  });
});

describe('adminService.updateRole', () => {
  it('updates user role', async () => {
    const updatedUser = { ...mockUser, role: 'ADMIN' };
    vi.mocked(adminRepository.findUserById).mockResolvedValue(mockUser as any);
    vi.mocked(adminRepository.updateUserRole).mockResolvedValue(updatedUser as any);

    const result = await adminService.updateRole('user-1', 'ADMIN');

    expect(adminRepository.findUserById).toHaveBeenCalledWith('user-1');
    expect(adminRepository.updateUserRole).toHaveBeenCalledWith('user-1', 'ADMIN');
    expect(result.role).toBe('ADMIN');
  });

  it('throws NotFoundError for missing user', async () => {
    vi.mocked(adminRepository.findUserById).mockResolvedValue(null);

    await expect(adminService.updateRole('missing', 'ADMIN')).rejects.toThrow(NotFoundError);
    expect(adminRepository.updateUserRole).not.toHaveBeenCalled();
  });
});

describe('adminService.deleteUser', () => {
  it('deletes user', async () => {
    vi.mocked(adminRepository.findUserById).mockResolvedValue(mockUser as any);
    vi.mocked(adminRepository.deleteUser).mockResolvedValue(mockUser as any);

    await adminService.deleteUser('user-1');

    expect(adminRepository.findUserById).toHaveBeenCalledWith('user-1');
    expect(adminRepository.deleteUser).toHaveBeenCalledWith('user-1');
  });

  it('throws NotFoundError for missing user', async () => {
    vi.mocked(adminRepository.findUserById).mockResolvedValue(null);

    await expect(adminService.deleteUser('missing')).rejects.toThrow(NotFoundError);
    expect(adminRepository.deleteUser).not.toHaveBeenCalled();
  });
});

describe('adminService.getAnalytics', () => {
  it('returns analytics counts', async () => {
    vi.mocked(adminRepository.getAnalytics).mockResolvedValue(mockAnalytics as any);

    const result = await adminService.getAnalytics();

    expect(result).toEqual(mockAnalytics);
    expect(adminRepository.getAnalytics).toHaveBeenCalled();
  });
});

describe('adminService.listAuditLogs', () => {
  it('returns paginated logs', async () => {
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(adminRepository.findAuditLogs).mockResolvedValue([mockAuditLog] as any);
    vi.mocked(adminRepository.countAuditLogs).mockResolvedValue(1);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    const result = await adminService.listAuditLogs({});

    expect(result.logs).toHaveLength(1);
    expect(result.logs[0].action).toBe('USER_DELETED');
    expect(result.meta).toEqual(mockPaginationMeta);
  });

  it('filters by search and action', async () => {
    vi.mocked(getPaginationParams).mockReturnValue(mockPaginationParams);
    vi.mocked(adminRepository.findAuditLogs).mockResolvedValue([]);
    vi.mocked(adminRepository.countAuditLogs).mockResolvedValue(0);
    vi.mocked(buildPaginationMeta).mockReturnValue(mockPaginationMeta);

    await adminService.listAuditLogs({ search: 'user', action: 'DELETE' });

    expect(adminRepository.findAuditLogs).toHaveBeenCalledWith({
      skip: 0,
      limit: 20,
      search: 'user',
      action: 'DELETE',
    });
    expect(adminRepository.countAuditLogs).toHaveBeenCalledWith({
      search: 'user',
      action: 'DELETE',
    });
  });
});
