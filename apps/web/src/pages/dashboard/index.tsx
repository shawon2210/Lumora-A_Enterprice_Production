import { motion } from 'framer-motion';
import { Activity, Users, TrendingUp, Smile, FileText, Upload, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useDashboard } from '@/hooks';
import { Card } from '@lumora/ui';
import { ChartCard } from '@/components/chart-card';
import { AreaChart } from '@/components/area-chart';
import { BarChart } from '@/components/bar-chart';
import { ErrorBoundary } from '@/components/error-boundary';

interface DashboardActivity {
  user: {
    name: string;
  };
  action: string;
  timestamp: string;
}

const topPages = [
  { label: '/pricing', value: 1240 },
  { label: '/features', value: 980 },
  { label: '/blog', value: 760 },
  { label: '/login', value: 540 },
  { label: '/docs', value: 320 },
];

const quickActions = [
  {
    icon: FileText,
    label: 'New Blog Post',
    description: 'Create and publish content',
    href: '/dashboard/blog',
    color: 'from-blue-500/20 to-blue-600/10',
  },
  {
    icon: Upload,
    label: 'Upload Media',
    description: 'Add images and videos',
    href: '/dashboard/media',
    color: 'from-purple-500/20 to-purple-600/10',
  },
  {
    icon: BarChart3,
    label: 'View Analytics',
    description: 'Check your metrics',
    href: '/admin/analytics',
    color: 'from-emerald-500/20 to-emerald-600/10',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function DashboardContent() {
  const user = useAuthStore((s) => s.user);
  const { data: dashboard } = useDashboard();

  const stats = [
    {
      icon: Activity,
      label: 'Total Sessions',
      value: dashboard.stats.totalSessions.toLocaleString(),
      change: `+${dashboard.stats.sessionChange}%`,
      positive: true,
    },
    {
      icon: Users,
      label: 'Active Users',
      value: dashboard.stats.activeUsers.toLocaleString(),
      change: `+${dashboard.stats.userChange}%`,
      positive: true,
    },
    {
      icon: TrendingUp,
      label: 'Revenue',
      value: `$${dashboard.stats.revenue.toLocaleString()}`,
      change: `+${dashboard.stats.revenueChange}%`,
      positive: true,
    },
    {
      icon: Smile,
      label: 'Satisfaction',
      value: `${dashboard.stats.satisfaction}%`,
      change: `+${dashboard.stats.satisfactionChange}%`,
      positive: true,
    },
  ];

  const activity =
    dashboard.recentActivity.length > 0
      ? dashboard.recentActivity.map((a: DashboardActivity) => ({
          user: a.user.name,
          action: a.action,
          time: a.timestamp,
          avatar: a.user.name
            .split(' ')
            .map((n: string) => n[0])
            .join(''),
        }))
      : [];

  const chartData = dashboard.chartData;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div>
        <h1 className="text-text-primary text-2xl font-semibold">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-text-secondary mt-1">Here's what's happening with your platform today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div className="bg-primary-500/10 rounded-xl p-2.5">
                  <stat.icon className="text-primary-400 h-5 w-5" />
                </div>
                <span className={`text-xs font-medium ${stat.positive ? 'text-success' : 'text-error'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-text-primary mt-4 text-2xl font-semibold">{stat.value}</p>
              <p className="text-text-tertiary mt-1 text-sm">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <ChartCard title="Weekly Views" description="Your page views over the past week">
            <AreaChart data={chartData} height={280} />
          </ChartCard>
        </motion.div>
        <motion.div variants={item}>
          <ChartCard title="Top Pages" description="Most visited pages this week">
            <BarChart data={topPages} height={280} color="var(--color-primary-400)" />
          </ChartCard>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="glass-card">
            <div className="border-border-secondary flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-text-primary text-base font-medium">Recent Activity</h2>
              <a
                href="/dashboard/notifications"
                className="text-primary-400 hover:text-primary-300 text-xs transition-colors"
              >
                View all
              </a>
            </div>
            {activity.length > 0 ? (
              <div className="divide-border-secondary divide-y">
                {activity.map((a: { user: string; action: string; time: string; avatar: string }) => (
                  <div key={a.time + a.user} className="flex items-center gap-3 px-6 py-3.5">
                    <div className="bg-primary-500/20 text-primary-400 flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium">
                      {a.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary text-sm">
                        <span className="font-medium">{a.user}</span>{' '}
                        <span className="text-text-secondary">{a.action}</span>
                      </p>
                    </div>
                    <span className="text-text-tertiary whitespace-nowrap text-xs">{a.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-text-tertiary text-sm">No recent activity</p>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          <h2 className="text-text-primary text-base font-medium">Quick Actions</h2>
          {quickActions.map((action) => (
            <a key={action.label} href={action.href} className="block">
              <Card
                className={`glass-card bg-linear-to-br p-5 ${action.color} cursor-pointer transition-all hover:brightness-110`}
              >
                <action.icon className="text-primary-400 h-6 w-6" />
                <h3 className="text-text-primary mt-3 text-sm font-medium">{action.label}</h3>
                <p className="text-text-tertiary mt-1 text-xs">{action.description}</p>
              </Card>
            </a>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
