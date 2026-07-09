import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export function BarChart({
  data,
  height = 250,
  color = 'var(--color-primary-500)',
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-text-tertiary flex h-[250px] items-center justify-center text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar data={data} barSize={32}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--surface-glass-heavy)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
          }}
          labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
        />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </RechartsBar>
    </ResponsiveContainer>
  );
}
