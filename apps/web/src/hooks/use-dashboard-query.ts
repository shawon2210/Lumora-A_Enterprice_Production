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

const demoDashboard: DashboardData = {
  stats: {
    totalSessions: 2847,
    activeUsers: 1482,
    revenue: 48290,
    satisfaction: 98.7,
    sessionChange: 12.5,
    userChange: 8.2,
    revenueChange: 23.1,
    satisfactionChange: 2.4,
  },
  recentActivity: [],
  chartData: [
    { date: 'Mon', value: 400 },
    { date: 'Tue', value: 300 },
    { date: 'Wed', value: 600 },
    { date: 'Thu', value: 800 },
    { date: 'Fri', value: 500 },
    { date: 'Sat', value: 700 },
    { date: 'Sun', value: 900 },
  ],
};

export function useDashboard() {
  return {
    data: demoDashboard,
    isLoading: false,
    error: null,
  };
}
