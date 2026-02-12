import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';

interface UFGDataPoint {
  date: string;
  ufg_pct: number;
}

interface UFGTrendChartProps {
  data: UFGDataPoint[];
  threshold?: number;
  height?: number;
}

export default function UFGTrendChart({ data, threshold = 1.5, height = 300 }: UFGTrendChartProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">UFG Trend (%)</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis className="text-xs" domain={[0, 'auto']} unit="%" />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
          <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="5 5" label={`Threshold: ${threshold}%`} />
          <Area type="monotone" dataKey="ufg_pct" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
