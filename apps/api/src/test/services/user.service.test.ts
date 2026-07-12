/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '@/modules/user/user.service';
import { userRepository } from '@/modules/user/user.repository';
import { prisma } from '@lumora/database';
import { NotFoundError } from '@/utils/errors';

vi.mock('@/modules/user/user.repository');
vi.mock('@lumora/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockProfile = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  role: 'USER' as any,
  subscription: 'FREE' as any,
  password: null,
  emailVerified: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('userService.getProfile', () => {
  it('returns user profile', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProfile);

    const result = await userService.getProfile('user-1');

    expect(result.id).toBe('user-1');
    expect(result.email).toBe('test@example.com');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        subscription: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('throws NotFoundError for missing user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(userService.getProfile('missing-id')).rejects.toThrow(NotFoundError);
  });
});

describe('userService.updateProfile', () => {
  const updateData = { name: 'New Name', avatar: 'https://example.com/avatar.jpg' };

  it('updates user name and avatar', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProfile);
    vi.mocked(userRepository.updateUser).mockResolvedValue({
      ...mockProfile,
      ...updateData,
    } as any);

    const result = await userService.updateProfile('user-1', updateData);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    expect(userRepository.updateUser).toHaveBeenCalledWith('user-1', updateData);
    expect(result.name).toBe('New Name');
  });

  it('updates only name', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProfile);
    vi.mocked(userRepository.updateUser).mockResolvedValue({
      ...mockProfile,
      name: 'Only Name',
    } as any);

    await userService.updateProfile('user-1', { name: 'Only Name' });

    expect(userRepository.updateUser).toHaveBeenCalledWith('user-1', { name: 'Only Name' });
  });

  it('updates only avatar', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockProfile);
    vi.mocked(userRepository.updateUser).mockResolvedValue({
      ...mockProfile,
      avatar: 'https://example.com/new-avatar.jpg',
    } as any);

    await userService.updateProfile('user-1', { avatar: 'https://example.com/new-avatar.jpg' });

    expect(userRepository.updateUser).toHaveBeenCalledWith('user-1', { avatar: 'https://example.com/new-avatar.jpg' });
  });

  it('throws NotFoundError for missing user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(userService.updateProfile('missing-id', { name: 'New Name' })).rejects.toThrow(NotFoundError);
    expect(userRepository.updateUser).not.toHaveBeenCalled();
  });
});
