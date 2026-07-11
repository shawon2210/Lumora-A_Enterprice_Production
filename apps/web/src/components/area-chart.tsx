import { useId } from 'react';
import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AreaChartProps {
  data: { date: string; value: number }[];
  height?: number;
  color?: string;
}

export function AreaChart({ data, height = 300, color = 'var(--color-primary-500)' }: AreaChartProps) {
  const gradientId = useId();
  if (!data || data.length === 0) {
    return (
      <div className="text-text-tertiary flex h-[300px] items-center justify-center text-sm">No data available</div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} role="img" aria-label="Area chart">
      <RechartsArea data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} width={60} />
        <Tooltip
          contentStyle={{
            background: 'var(--surface-glass-heavy)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-glass)',
          }}
          labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: 'var(--surface-primary)', strokeWidth: 2 }}
        />
      </RechartsArea>
    </ResponsiveContainer>
  );
}
