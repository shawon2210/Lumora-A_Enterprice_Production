import { prisma } from '@lumora/database';
import type { Prisma, Role } from '@prisma/client';

export const adminRepository = {
  findUsers(params: { skip: number; limit: number; search?: string; role?: string }) {
    const where: Prisma.UserWhereInput = {};
    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.role) where.role = params.role as Role;
    return prisma.user.findMany({
      where,
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
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
        _count: { select: { blogPosts: true, sessions: true } },
      },
    });
  },

  countUsers(params: { search?: string; role?: string }) {
    const where: Prisma.UserWhereInput = {};
    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.role) where.role = params.role as Role;
    return prisma.user.count({ where });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  updateUserRole(id: string, role: string) {
    return prisma.user.update({
      where: { id },
      data: { role: role as Role },
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
  },

  deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  async getAnalytics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const [totalUsers, totalPosts, totalMedia, activeUsers, signupsToday] = await Promise.all([
      prisma.user.count(),
      prisma.blogPost.count(),
      prisma.media.count(),
      prisma.session.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    ]);
    return { totalUsers, totalPosts, totalMedia, activeUsers, signupsToday, revenue: 0 };
  },

  findAuditLogs(params: { skip: number; limit: number; search?: string; action?: string }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (params.search) {
      where.OR = [
        { entity: { contains: params.search, mode: 'insensitive' } },
        { action: { contains: params.search, mode: 'insensitive' } },
        { user: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }
    if (params.action) where.action = { contains: params.action, mode: 'insensitive' };
    return prisma.auditLog.findMany({
      where,
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
  },

  countAuditLogs(params: { search?: string; action?: string }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (params.search) {
      where.OR = [
        { entity: { contains: params.search, mode: 'insensitive' } },
        { action: { contains: params.search, mode: 'insensitive' } },
        { user: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }
    if (params.action) where.action = { contains: params.action, mode: 'insensitive' };
    return prisma.auditLog.count({ where });
  },
};
