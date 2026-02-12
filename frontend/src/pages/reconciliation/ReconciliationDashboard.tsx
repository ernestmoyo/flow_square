import { useState } from 'react';
import KPICard from '../../components/common/KPICard';
import StatusBadge from '../../components/common/StatusBadge';
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react';

const DEMO_RUNS = [
  { id: 'REC-001', name: 'Daily Recon 2025-01-15', status: 'AUTO_CLOSED', variance_pct: 0.42, period: '15 Jan 2025', exceptions: 0 },
  { id: 'REC-002', name: 'Daily Recon 2025-01-14', status: 'EXCEPTION', variance_pct: 2.1, period: '14 Jan 2025', exceptions: 3 },
  { id: 'REC-003', name: 'Daily Recon 2025-01-13', status: 'AUTO_CLOSED', variance_pct: 0.38, period: '13 Jan 2025', exceptions: 0 },
  { id: 'REC-004', name: 'Weekly Recon W2', status: 'AUTO_CLOSED', variance_pct: 0.55, period: 'Week 2, 2025', exceptions: 0 },
  { id: 'REC-005', name: 'Daily Recon 2025-01-12', status: 'EXCEPTION', variance_pct: 1.8, period: '12 Jan 2025', exceptions: 2 },
  { id: 'REC-006', name: 'Daily Recon 2025-01-11', status: 'AUTO_CLOSED', variance_pct: 0.29, period: '11 Jan 2025', exceptions: 0 },
];

export default function ReconciliationDashboard() {
  const autoClosedCount = DEMO_RUNS.filter((r) => r.status === 'AUTO_CLOSED').length;
  const exceptionCount = DEMO_RUNS.filter((r) => r.status === 'EXCEPTION').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reconciliation</h1>
          <p className="text-sm text-muted-foreground">Ship → Tank → Truck → Delivery auto-reconciliation</p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          Trigger Manual Recon
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Total Runs" value={String(DEMO_RUNS.length)} subtitle="last 7 days" icon={<Activity className="h-5 w-5" />} />
        <KPICard title="Auto-Closed" value={String(autoClosedCount)} subtitle="within tolerance" icon={<CheckCircle className="h-5 w-5" />} />
        <KPICard title="Exceptions" value={String(exceptionCount)} subtitle="needs review" icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Avg Variance" value="0.95%" subtitle="trending down" trend="down" trendValue="0.3%" trendPositive />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Recent Reconciliation Runs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Period</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Variance</th>
                <th className="px-4 py-3 text-right font-medium">Exceptions</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_RUNS.map((run) => (
                <tr key={run.id} className="border-b hover:bg-muted/25 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs">{run.id}</td>
                  <td className="px-4 py-3">{run.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{run.period}</td>
                  <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                  <td className={`px-4 py-3 text-right font-medium ${run.variance_pct > 1.5 ? 'text-red-600' : 'text-green-600'}`}>
                    {run.variance_pct.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right">{run.exceptions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
