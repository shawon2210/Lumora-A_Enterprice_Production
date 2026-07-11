import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  UserCog,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAdminUsers, useUpdateUserRole, useDeleteUser, useDebounce } from '@/hooks';
import { Card, Badge, Button, Skeleton, toast } from '@lumora/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@lumora/ui';
import { ErrorBoundary } from '@/components/error-boundary';
import type { User } from '@lumora/shared';

const roleBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  ADMIN: { label: 'Admin', variant: 'default' },
  MODERATOR: { label: 'Moderator', variant: 'secondary' },
  USER: { label: 'User', variant: 'outline' },
};

const ITEMS_PER_PAGE = 5;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function UsersContent() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
  });

  const updateRoleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();

  const users = data?.users ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;

  const handleRoleChange = useCallback(
    (user: User, newRole: string) => {
      updateRoleMutation.mutate({ id: user.id, role: newRole });
    },
    [updateRoleMutation],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync({ id: deleteTarget.id });
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  if (isLoading) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Card className="glass-card overflow-hidden">
          <div className="divide-border-secondary divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-error mx-auto h-12 w-12" />
          <h2 className="text-text-primary mt-4 text-lg font-semibold">Failed to load users</h2>
          <p className="text-text-secondary mt-2 text-sm">There was an error fetching users.</p>
          <Button onClick={() => refetch()} className="mt-6 gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-text-primary text-2xl font-semibold">Users</h1>
        <p className="text-text-secondary mt-1 text-sm">Manage user accounts and permissions.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="text-text-tertiary pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search users..."
              className="border-border-secondary bg-surface-secondary text-text-primary placeholder-text-tertiary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-1"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="border-border-secondary bg-surface-secondary text-text-primary rounded-xl border px-3 py-2 text-sm outline-none"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MODERATOR">Moderator</option>
            <option value="USER">User</option>
          </select>
        </div>

        <Button
          className="gap-2 rounded-xl bg-white text-neutral-900 hover:bg-white/90"
          onClick={() => toast({ title: 'Invite feature coming soon' })}
        >
          <UserCog className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border-secondary border-b">
                <th className="text-text-tertiary px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  User
                </th>
                <th className="text-text-tertiary px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  Role
                </th>
                <th className="text-text-tertiary px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-text-tertiary px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-secondary divide-y">
              {users.map((user) => {
                const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();
                return (
                  <motion.tr key={user.id} variants={item} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="from-primary-500/20 to-primary-400/20 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-medium text-white/70">
                          {initials}
                        </div>
                        <div>
                          <p className="text-text-primary text-sm font-medium">{user.name ?? 'Unnamed'}</p>
                          <p className="text-text-tertiary text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={(roleBadge[user.role] ?? roleBadge.USER).variant}>
                        {(roleBadge[user.role] ?? roleBadge.USER).label}
                      </Badge>
                    </td>
                    <td className="text-text-secondary px-5 py-3.5 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-text-tertiary hover:text-text-primary hover:bg-surface-secondary rounded-lg p-1.5 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={user.role === 'ADMIN'}
                            onClick={() => handleRoleChange(user, user.role === 'USER' ? 'MODERATOR' : 'USER')}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {user.role === 'USER' ? 'Make Moderator' : 'Make User'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error"
                            disabled={user.role === 'ADMIN'}
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <UserCog className="text-text-tertiary/50 mb-3 h-12 w-12" />
            <p className="text-text-tertiary text-sm">No users found</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-border-secondary flex items-center justify-between border-t px-5 py-3.5">
            <p className="text-text-tertiary text-xs">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, meta?.total ?? 0)} of{' '}
              {meta?.total ?? 0}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-text-tertiary hover:text-text-primary hover:bg-surface-secondary rounded-lg p-1.5 transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium transition-all ${
                    page === i + 1
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-text-tertiary hover:text-text-primary hover:bg-surface-secondary'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-text-tertiary hover:text-text-primary hover:bg-surface-secondary rounded-lg p-1.5 transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteTarget?.name ?? deleteTarget?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} className="gap-2">
              {deleteMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default function AdminUsersPage() {
  return (
    <ErrorBoundary>
      <UsersContent />
    </ErrorBoundary>
  );
}
