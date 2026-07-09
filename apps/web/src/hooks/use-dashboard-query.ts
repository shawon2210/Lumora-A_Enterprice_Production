import { useApiQuery } from './use-api';

interface DashboardStats {
  totalSessions: number;
  activeUsers: number;
  revenue: number;
  satisfaction: number;
  sessionChange: number;
  userChange: number;
  revenueChange: number;
  satisfactionChange: number;
}

interface ActivityItem {
  id: string;
  user: { name: string; avatar: string | null };
  action: string;
  timestamp: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  chartData: { date: string; value: number }[];
}

export function useDashboard() {
  return useApiQuery<DashboardData>(['dashboard'], '/admin/analytics', {
    staleTime: 1000 * 30,
  });
}
