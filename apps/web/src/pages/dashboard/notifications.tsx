import { motion } from 'framer-motion';
import { Bell, CheckCheck, FileText, UserPlus, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, Button, Skeleton } from '@lumora/ui';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks';
import { ErrorBoundary } from '@/components/error-boundary';
import type { Notification } from '@lumora/shared';
import { useQueryClient } from '@tanstack/react-query';

const typeConfig: Record<string, { icon: typeof FileText; color: string }> = {
  INFO: { icon: FileText, color: 'bg-blue-500/20 text-blue-400' },
  SUCCESS: { icon: UserPlus, color: 'bg-emerald-500/20 text-emerald-400' },
  WARNING: { icon: AlertCircle, color: 'bg-amber-500/20 text-amber-400' },
  ERROR: { icon: AlertCircle, color: 'bg-rose-500/20 text-rose-400' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

function NotificationsContent() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications: Notification[] = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkRead = (id: string) => {
    markRead.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
      },
    );
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
        <Card className="glass-card overflow-hidden">
          <div className="divide-border-secondary divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-error mx-auto h-12 w-12" />
          <h2 className="text-text-primary mt-4 text-lg font-semibold">Failed to load notifications</h2>
          <p className="text-text-secondary mt-2 text-sm">There was an error fetching your notifications.</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-semibold">Notifications</h1>
          <p className="text-text-secondary mt-1 text-sm">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            className="gap-2 text-sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Bell className="text-text-tertiary/50 mb-3 h-12 w-12" />
          <p className="text-text-primary text-base font-medium">No notifications</p>
          <p className="text-text-tertiary mt-1 text-sm">You're all caught up!</p>
        </div>
      ) : (
        <Card className="glass-card overflow-hidden">
          <div className="divide-border-secondary divide-y">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type] ?? typeConfig.INFO;
              return (
                <motion.div
                  key={notification.id}
                  variants={item}
                  className={`flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors ${
                    notification.read ? 'opacity-60 hover:opacity-80' : 'bg-primary-500/[0.02]'
                  }`}
                  onClick={() => !notification.read && handleMarkRead(notification.id)}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.color}`}>
                    <config.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!notification.read && <span className="bg-primary-400 h-2 w-2 shrink-0 rounded-full" />}
                      <p
                        className={`text-sm ${notification.read ? 'text-text-secondary' : 'text-text-primary font-medium'}`}
                      >
                        {notification.title}
                      </p>
                    </div>
                    <p className="text-text-tertiary mt-0.5 text-xs">{notification.message}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-text-tertiary whitespace-nowrap text-xs">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </motion.div>
  );
}

export default function NotificationsPage() {
  return (
    <ErrorBoundary>
      <NotificationsContent />
    </ErrorBoundary>
  );
}
