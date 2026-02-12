import KPICard from '../../components/common/KPICard';
import { Wrench, Clock, Activity } from 'lucide-react';

const EQUIPMENT = [
  { tag: 'PUMP-001', name: 'Main Transfer Pump A', rul_hours: 2160, confidence: 78, vibration: 'STABLE', temp: 'STABLE', runtime: 8760 },
  { tag: 'PUMP-002', name: 'Main Transfer Pump B', rul_hours: 890, confidence: 85, vibration: 'INCREASING', temp: 'STABLE', runtime: 12400 },
  { tag: 'COMP-001', name: 'VRU Compressor', rul_hours: 4320, confidence: 72, vibration: 'STABLE', temp: 'STABLE', runtime: 6200 },
  { tag: 'MTR-001', name: 'Loading Arm Motor 1', rul_hours: 168, confidence: 91, vibration: 'CRITICAL', temp: 'INCREASING', runtime: 15600 },
  { tag: 'GEN-001', name: 'Standby Generator', rul_hours: 6500, confidence: 65, vibration: 'STABLE', temp: 'STABLE', runtime: 3200 },
];

function getTrendBadge(trend: string) {
  switch (trend) {
    case 'STABLE': return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Stable</span>;
    case 'INCREASING': return <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">Increasing</span>;
    case 'CRITICAL': return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">Critical</span>;
    default: return <span className="text-xs text-muted-foreground">{trend}</span>;
  }
}

function getRULColor(hours: number) {
  if (hours < 168) return 'text-red-600 font-bold';
  if (hours < 720) return 'text-orange-600 font-semibold';
  return 'text-green-600';
}

export default function PredictiveMaintenance() {
  const criticalCount = EQUIPMENT.filter((e) => e.rul_hours < 720).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Predictive Maintenance</h1>
      <p className="text-sm text-muted-foreground">Remaining Useful Life estimates for rotating equipment</p>

      <div className="grid gap-4 md:grid-cols-3">
        <KPICard title="Equipment Monitored" value={String(EQUIPMENT.length)} icon={<Wrench className="h-5 w-5" />} />
        <KPICard title="Attention Required" value={String(criticalCount)} subtitle="RUL < 30 days" trend={criticalCount > 0 ? 'up' : 'flat'} trendPositive={false} icon={<Clock className="h-5 w-5" />} />
        <KPICard title="Avg Confidence" value="78%" subtitle="across all models" icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Equipment Health Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Tag</th>
                <th className="px-4 py-3 text-left font-medium">Equipment</th>
                <th className="px-4 py-3 text-right font-medium">RUL (hours)</th>
                <th className="px-4 py-3 text-right font-medium">Confidence</th>
                <th className="px-4 py-3 text-center font-medium">Vibration</th>
                <th className="px-4 py-3 text-center font-medium">Temperature</th>
                <th className="px-4 py-3 text-right font-medium">Runtime (h)</th>
              </tr>
            </thead>
            <tbody>
              {EQUIPMENT.map((eq) => (
                <tr key={eq.tag} className="border-b">
                  <td className="px-4 py-3 font-mono text-xs">{eq.tag}</td>
                  <td className="px-4 py-3">{eq.name}</td>
                  <td className={`px-4 py-3 text-right ${getRULColor(eq.rul_hours)}`}>{eq.rul_hours.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{eq.confidence}%</td>
                  <td className="px-4 py-3 text-center">{getTrendBadge(eq.vibration)}</td>
                  <td className="px-4 py-3 text-center">{getTrendBadge(eq.temp)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{eq.runtime.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
