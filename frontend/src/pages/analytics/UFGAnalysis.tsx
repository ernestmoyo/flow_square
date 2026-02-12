import { useState } from 'react';
import KPICard from '../../components/common/KPICard';
import UFGTrendChart from '../../components/charts/UFGTrendChart';
import { BarChart3, TrendingDown } from 'lucide-react';

const DEMO_TREND = [
  { date: 'Jan', ufg_pct: 1.8 },
  { date: 'Feb', ufg_pct: 1.6 },
  { date: 'Mar', ufg_pct: 1.4 },
  { date: 'Apr', ufg_pct: 1.2 },
  { date: 'May', ufg_pct: 1.1 },
  { date: 'Jun', ufg_pct: 0.9 },
  { date: 'Jul', ufg_pct: 0.85 },
  { date: 'Aug', ufg_pct: 0.7 },
];

const NODE_BREAKDOWN = [
  { node: 'Vessel Discharge', expected: 45200, actual: 44980, variance_pct: 0.49 },
  { node: 'Tank Receipt', expected: 44980, actual: 44850, variance_pct: 0.29 },
  { node: 'Gantry Loading', expected: 44850, actual: 44620, variance_pct: 0.51 },
  { node: 'Delivery (ePOD)', expected: 44620, actual: 44400, variance_pct: 0.49 },
];

export default function UFGAnalysis() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">UFG Analysis</h1>
      <p className="text-sm text-muted-foreground">Unaccounted-For-Gas losses by node and time period</p>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Current UFG" value="0.70%" subtitle="last 30 days" trend="down" trendValue="15%" trendPositive icon={<TrendingDown className="h-5 w-5" />} />
        <KPICard title="Receipts" value="45,200 m³" subtitle="this period" />
        <KPICard title="Dispatches" value="44,400 m³" subtitle="this period" />
        <KPICard title="Loss Volume" value="800 m³" subtitle="$48,000 value" trend="down" trendValue="22%" trendPositive />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <UFGTrendChart data={DEMO_TREND} threshold={1.5} />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Node-by-Node Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Node</th>
                <th className="px-4 py-3 text-right font-medium">Expected (m³)</th>
                <th className="px-4 py-3 text-right font-medium">Actual (m³)</th>
                <th className="px-4 py-3 text-right font-medium">Variance</th>
              </tr>
            </thead>
            <tbody>
              {NODE_BREAKDOWN.map((row) => (
                <tr key={row.node} className="border-b">
                  <td className="px-4 py-3">{row.node}</td>
                  <td className="px-4 py-3 text-right">{row.expected.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{row.actual.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-medium ${row.variance_pct > 1.5 ? 'text-red-600' : 'text-green-600'}`}>
                    {row.variance_pct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
