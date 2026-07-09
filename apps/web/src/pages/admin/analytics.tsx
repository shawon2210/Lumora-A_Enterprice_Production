import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  Globe,
  ArrowUp,
  ArrowDown,
  FileText,
  Image,
  DollarSign,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAdminAnalytics } from '@/hooks';
import { Card, Skeleton, Button } from '@lumora/ui';
import { ErrorBoundary } from '@/components/error-boundary';
import { AreaChart } from '@/components/area-chart';

const weeklyData = [
  { date: 'Mon', value: 3400 },
  { date: 'Tue', value: 4200 },
  { date: 'Wed', value: 5100 },
  { date: 'Thu', value: 4800 },
  { date: 'Fri', value: 5900 },
  { date: 'Sat', value: 3700 },
  { date: 'Sun', value: 2900 },
];

const visitorData = [
  { date: 'Mon', value: 2100 },
  { date: 'Tue', value: 2800 },
  { date: 'Wed', value: 3400 },
  { date: 'Thu', value: 3100 },
  { date: 'Fri', value: 3900 },
  { date: 'Sat', value: 2400 },
  { date: 'Sun', value: 1800 },
];

const topCountries = [
  { country: 'United States', flag: '🇺🇸', visitors: 12480, percentage: 38 },
  { country: 'United Kingdom', flag: '🇬🇧', visitors: 5840, percentage: 18 },
  { country: 'Germany', flag: '🇩🇪', visitors: 3920, percentage: 12 },
  { country: 'Canada', flag: '🇨🇦', visitors: 2840, percentage: 9 },
  { country: 'Australia', flag: '🇦🇺', visitors: 1950, percentage: 6 },
];

const recentPageViews = [
  { page: '/dashboard', views: 2847, change: '+12.5%', positive: true },
  { page: '/blog/future-minimalism', views: 1832, change: '+8.2%', positive: true },
  { page: '/pricing', views: 1521, change: '-3.1%', positive: false },
  { page: '/features', views: 1289, change: '+23.4%', positive: true },
  { page: '/docs/getting-started', views: 967, change: '+15.7%', positive: true },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function AnalyticsContent() {
  const { data, isLoading, isError, refetch } = useAdminAnalytics();

  const apiStats = data
    ? [
        {
          icon: Users,
          label: 'Total Users',
          value: data.totalUsers.toLocaleString(),
          color: 'from-blue-500/20 to-cyan-500/20',
        },
        {
          icon: FileText,
          label: 'Blog Posts',
          value: data.totalPosts.toLocaleString(),
          color: 'from-purple-500/20 to-pink-500/20',
        },
        {
          icon: Image,
          label: 'Media Files',
          value: data.totalMedia.toLocaleString(),
          color: 'from-emerald-500/20 to-teal-500/20',
        },
        {
          icon: Activity,
          label: 'Active Users',
          value: data.activeUsers.toLocaleString(),
          color: 'from-amber-500/20 to-orange-500/20',
        },
        {
          icon: TrendingUp,
          label: 'Signups Today',
          value: data.signupsToday.toLocaleString(),
          color: 'from-rose-500/20 to-red-500/20',
        },
        {
          icon: DollarSign,
          label: 'Revenue',
          value: `$${data.revenue.toLocaleString()}`,
          color: 'from-sky-500/20 to-blue-500/20',
        },
      ]
    : null;

  const fallbackStats = [
    { icon: Eye, label: 'Page Views', value: '84,291', color: 'from-blue-500/20 to-cyan-500/20' },
    {
      icon: Users,
      label: 'Unique Visitors',
      value: '32,481',
      color: 'from-purple-500/20 to-pink-500/20',
    },
    {
      icon: MousePointerClick,
      label: 'Click Rate',
      value: '6.8%',
      color: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Bounce Rate',
      value: '32.4%',
      color: 'from-amber-500/20 to-orange-500/20',
    },
  ];

  const displayStats = apiStats ?? fallbackStats;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-text-primary text-2xl font-semibold">Analytics</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Track your platform's performance metrics.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-4 h-8 w-24" />
              <Skeleton className="mt-1 h-4 w-20" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="text-error mx-auto h-10 w-10" />
            <p className="text-text-secondary mt-2 text-sm">Failed to load analytics</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4 gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {displayStats.map((stat) => (
            <motion.div key={stat.label} variants={item}>
              <Card className="glass-card p-5">
                <div className={`rounded-xl bg-gradient-to-br ${stat.color} inline-flex p-2.5`}>
                  <stat.icon className="h-5 w-5 text-white/70" />
                </div>
                <p className="text-text-primary mt-4 text-2xl font-semibold">{stat.value}</p>
                <p className="text-text-tertiary mt-1 text-sm">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="glass-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-text-primary text-base font-medium">Weekly Traffic</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="bg-primary-400 h-2.5 w-2.5 rounded-full" />
                  <span className="text-text-tertiary text-xs">Views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-primary-400/40 h-2.5 w-2.5 rounded-full" />
                  <span className="text-text-tertiary text-xs">Visitors</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-text-tertiary mb-2 text-xs font-medium">Page Views</p>
                <AreaChart data={weeklyData} height={120} />
              </div>
              <div>
                <p className="text-text-tertiary mb-2 text-xs font-medium">Visitors</p>
                <AreaChart data={visitorData} height={120} color="var(--color-primary-500)" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          <Card className="glass-card p-6">
            <h2 className="text-text-primary mb-4 text-base font-medium">Top Countries</h2>
            <div className="space-y-4">
              {topCountries.map((country) => (
                <div key={country.country}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span className="text-text-primary text-sm">{country.country}</span>
                    </div>
                    <span className="text-text-tertiary text-xs">
                      {country.visitors.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-surface-secondary h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary-400/50 h-full rounded-full transition-all"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="glass-card overflow-hidden">
          <div className="border-border-secondary border-b px-6 py-4">
            <h2 className="text-text-primary text-base font-medium">Top Pages</h2>
          </div>
          <div className="divide-border-secondary divide-y">
            {recentPageViews.map((page) => (
              <div key={page.page} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <Globe className="text-text-tertiary h-4 w-4" />
                  <span className="text-text-primary font-mono text-sm">{page.page}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-text-secondary text-sm">
                    {page.views.toLocaleString()} views
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${page.positive ? 'text-success' : 'text-error'}`}
                  >
                    {page.positive ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {page.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <ErrorBoundary>
      <AnalyticsContent />
    </ErrorBoundary>
  );
}
