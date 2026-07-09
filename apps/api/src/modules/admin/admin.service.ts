import { adminRepository } from './admin.repository';
import { getPaginationParams, buildPaginationMeta } from '@/utils/pagination';
import { NotFoundError } from '@/utils/errors';

export const adminService = {
  async listUsers(query: { page?: string; limit?: string; search?: string; role?: string }) {
    const { page, limit, skip } = getPaginationParams({
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });
    const [users, total] = await Promise.all([
      adminRepository.findUsers({ skip, limit, search: query.search, role: query.role }),
      adminRepository.countUsers({ search: query.search, role: query.role }),
    ]);
    return { users, meta: buildPaginationMeta(total, page, limit) };
  },

  async getUser(id: string) {
    const user = await adminRepository.findUserById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  },

  async updateRole(id: string, role: string) {
    const user = await adminRepository.findUserById(id);
    if (!user) throw new NotFoundError('User');
    return adminRepository.updateUserRole(id, role);
  },

  async deleteUser(id: string) {
    const user = await adminRepository.findUserById(id);
    if (!user) throw new NotFoundError('User');
    await adminRepository.deleteUser(id);
  },

  async getAnalytics() {
    return adminRepository.getAnalytics();
  },

  async listAuditLogs(query: { page?: string; limit?: string; search?: string; action?: string }) {
    const { page, limit, skip } = getPaginationParams({
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });
    const [logs, total] = await Promise.all([
      adminRepository.findAuditLogs({ skip, limit, search: query.search, action: query.action }),
      adminRepository.countAuditLogs({ search: query.search, action: query.action }),
    ]);
    return { logs, meta: buildPaginationMeta(total, page, limit) };
  },
};
