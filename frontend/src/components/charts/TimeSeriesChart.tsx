import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';

interface DataPoint {
  time: string;
  value: number;
  [key: string]: unknown;
}

interface TimeSeriesChartProps {
  data: DataPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
  title?: string;
  unit?: string;
}

export default function TimeSeriesChart({
  data,
  dataKey = 'value',
  color = '#3b82f6',
  height = 300,
  title,
  unit,
}: TimeSeriesChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    formattedTime: format(parseISO(d.time), 'HH:mm'),
  }));

  return (
    <div>
      {title && <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="formattedTime" className="text-xs" />
          <YAxis className="text-xs" unit={unit ? ` ${unit}` : undefined} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
