import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  Shield,
  User,
  FileText,
  Settings,
  LogIn,
  Trash2,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuditLogs, useDebounce } from '@/hooks';
import { Card, Badge, Button, Skeleton } from '@lumora/ui';
import { ErrorBoundary } from '@/components/error-boundary';

type Severity = 'info' | 'warning' | 'error';

const actionConfig: Record<string, { icon: typeof Shield; label: string }> = {
  create: { icon: FileText, label: 'Create' },
  update: { icon: Settings, label: 'Update' },
  delete: { icon: Trash2, label: 'Delete' },
  login: { icon: LogIn, label: 'Login' },
  export: { icon: Download, label: 'Export' },
  settings: { icon: Settings, label: 'Settings' },
};

const severityBadge: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  info: { label: 'Info', variant: 'secondary' },
  warning: { label: 'Warning', variant: 'default' },
  error: { label: 'Error', variant: 'destructive' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

interface LogDisplay {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  ip: string;
  severity: Severity;
}

function LogsContent() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useAuditLogs({
    search: debouncedSearch || undefined,
    severity: severityFilter !== 'all' ? severityFilter : undefined,
  });

  const rawLogs = data?.logs ?? [];

  const logs: LogDisplay[] = rawLogs.map((log) => ({
    id: log.id,
    timestamp: new Date(log.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    user: log.user.name,
    action: log.action,
    entity: log.entity,
    ip: (log.metadata?.ip as string) ?? 'N/A',
    severity: (log.metadata?.severity as Severity) ?? 'info',
  }));

  if (isLoading) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <Card className="glass-card overflow-hidden">
          <div className="divide-border-secondary divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-40 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16 rounded-full" />
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
          <h2 className="text-text-primary mt-4 text-lg font-semibold">Failed to load logs</h2>
          <p className="text-text-secondary mt-2 text-sm">
            There was an error fetching audit logs.
          </p>
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
        <h1 className="text-text-primary text-2xl font-semibold">Audit Logs</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Track all activities and changes across the platform.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="text-text-tertiary pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="border-border-secondary bg-surface-secondary text-text-primary placeholder-text-tertiary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-1"
            />
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border-border-secondary bg-surface-secondary text-text-primary rounded-xl border px-3 py-2 text-sm outline-none"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="text-text-tertiary pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="date"
              className="border-border-secondary bg-surface-secondary text-text-primary rounded-xl border py-2 pl-10 pr-4 text-sm outline-none"
            />
          </div>
          <Button variant="outline" className="gap-2 rounded-xl text-sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border-secondary border-b">
                <th className="text-text-tertiary px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="text-text-tertiary px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  User
                </th>
                <th className="text-text-tertiary px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  Action
                </th>
                <th className="text-text-tertiary px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  Entity
                </th>
                <th className="text-text-tertiary px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  IP Address
                </th>
                <th className="text-text-tertiary px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wider">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="divide-border-secondary divide-y">
              {logs.map((log) => {
                const action = actionConfig[log.action] ?? { icon: Shield, label: log.action };
                return (
                  <motion.tr
                    key={log.id}
                    variants={item}
                    className="hover:bg-surface-secondary/50 transition-colors"
                  >
                    <td className="text-text-secondary px-5 py-3.5 font-mono text-xs">
                      {log.timestamp}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <User className="text-text-tertiary h-3.5 w-3.5" />
                        <span className="text-text-primary text-sm">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <action.icon className="text-text-tertiary h-3.5 w-3.5" />
                        <span className="text-text-secondary text-sm">{action.label}</span>
                      </div>
                    </td>
                    <td className="text-text-primary px-5 py-3.5 text-sm">{log.entity}</td>
                    <td className="text-text-secondary px-5 py-3.5 font-mono text-xs">{log.ip}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Badge variant={severityBadge[log.severity]?.variant ?? 'secondary'}>
                        {severityBadge[log.severity]?.label ?? 'Info'}
                      </Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Shield className="text-text-tertiary/50 mb-3 h-12 w-12" />
            <p className="text-text-tertiary text-sm">No log entries found</p>
          </div>
        )}

        {data?.meta && (
          <div className="border-border-secondary flex items-center justify-between border-t px-5 py-3.5">
            <p className="text-text-tertiary text-xs">
              Showing {logs.length} of {data.meta.total} entries
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default function AdminLogsPage() {
  return (
    <ErrorBoundary>
      <LogsContent />
    </ErrorBoundary>
  );
}
