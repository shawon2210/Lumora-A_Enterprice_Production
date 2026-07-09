import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  FileText,
  UserPlus,
  Settings,
  AlertCircle,
  ShoppingCart,
  X,
} from 'lucide-react';
import { Card, Button } from '@lumora/ui';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'post' | 'user' | 'system' | 'alert' | 'order';
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'New blog post published',
    message: 'Sarah Chen published "The Future of Digital Minimalism"',
    time: '2 min ago',
    read: false,
    type: 'post',
  },
  {
    id: '2',
    title: 'User account created',
    message: 'A new user account was created by Alex Kim',
    time: '15 min ago',
    read: false,
    type: 'user',
  },
  {
    id: '3',
    title: 'System update complete',
    message: 'Version 2.4.1 has been deployed successfully',
    time: '1 hour ago',
    read: false,
    type: 'system',
  },
  {
    id: '4',
    title: 'Storage limit warning',
    message: 'Your media storage is at 85% capacity',
    time: '3 hours ago',
    read: true,
    type: 'alert',
  },
  {
    id: '5',
    title: 'New order received',
    message: 'Premium plan subscription from acme@company.com',
    time: '5 hours ago',
    read: true,
    type: 'order',
  },
  {
    id: '6',
    title: 'Blog post approved',
    message: 'Emily Rodriguez approved "UX Principles for 2026"',
    time: '1 day ago',
    read: true,
    type: 'post',
  },
  {
    id: '7',
    title: 'Security alert',
    message: 'New login detected from San Francisco, CA',
    time: '2 days ago',
    read: true,
    type: 'alert',
  },
];

const typeConfig = {
  post: { icon: FileText, color: 'bg-blue-500/20 text-blue-400' },
  user: { icon: UserPlus, color: 'bg-emerald-500/20 text-emerald-400' },
  system: { icon: Settings, color: 'bg-purple-500/20 text-purple-400' },
  alert: { icon: AlertCircle, color: 'bg-amber-500/20 text-amber-400' },
  order: { icon: ShoppingCart, color: 'bg-rose-500/20 text-rose-400' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

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
          <Button variant="ghost" className="gap-2 text-sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="divide-border-secondary divide-y">
          {notifications.map((notification) => {
            const config = typeConfig[notification.type];
            return (
              <motion.div
                key={notification.id}
                variants={item}
                className={`flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors ${
                  notification.read ? 'opacity-60 hover:opacity-80' : 'bg-primary-500/[0.02]'
                }`}
                onClick={() => toggleRead(notification.id)}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.color}`}
                >
                  <config.icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <span className="bg-primary-400 h-2 w-2 shrink-0 rounded-full" />
                    )}
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
                    {notification.time}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                    className="text-text-tertiary hover:text-text-primary hover:bg-surface-secondary rounded-lg p-1 opacity-0 transition-all group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Bell className="text-text-tertiary/50 mb-3 h-12 w-12" />
          <p className="text-text-tertiary text-sm">No notifications</p>
        </div>
      )}
    </motion.div>
  );
}
