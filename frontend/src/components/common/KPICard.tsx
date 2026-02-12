import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
}

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  trendPositive = true,
  icon,
}: KPICardProps) {
  const trendColor = trend === 'flat'
    ? 'text-muted-foreground'
    : (trend === 'up') === trendPositive
      ? 'text-green-600'
      : 'text-red-600';

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-1">
            {trend && (
              <span className={`flex items-center gap-0.5 text-xs ${trendColor}`}>
                {trend === 'up' && <ArrowUp className="h-3 w-3" />}
                {trend === 'down' && <ArrowDown className="h-3 w-3" />}
                {trend === 'flat' && <Minus className="h-3 w-3" />}
                {trendValue}
              </span>
            )}
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
