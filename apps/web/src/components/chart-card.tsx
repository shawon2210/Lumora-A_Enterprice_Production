import type { ReactNode } from 'react';
import { Card } from '@lumora/ui';

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, description, action, children, className }: ChartCardProps) {
  return (
    <Card className={`glass-card ${className || ''}`}>
      <div className="border-border-secondary flex items-center justify-between border-b px-6 py-4">
        <div>
          <h3 className="text-text-primary text-sm font-medium">{title}</h3>
          {description && <p className="text-text-tertiary mt-0.5 text-xs">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </Card>
  );
}
