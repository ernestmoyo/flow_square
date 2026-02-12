import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DemurrageDataPoint {
  vessel: string;
  cost_usd: number;
}

interface DemurrageCostChartProps {
  data: DemurrageDataPoint[];
  height?: number;
}

export default function DemurrageCostChart({ data, height = 300 }: DemurrageCostChartProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Demurrage Costs (USD)</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="vessel" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
          <Bar dataKey="cost_usd" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
