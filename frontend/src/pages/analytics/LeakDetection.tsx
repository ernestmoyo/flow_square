import KPICard from '../../components/common/KPICard';
import FraudScoreGauge from '../../components/charts/FraudScoreGauge';
import { AlertTriangle, Shield } from 'lucide-react';

const SEGMENTS = [
  { id: 'SEG-001', name: 'Dar es Salaam — Morogoro', score: 12, status: 'Low' },
  { id: 'SEG-002', name: 'Morogoro — Dodoma', score: 35, status: 'Medium' },
  { id: 'SEG-003', name: 'Dodoma — Singida', score: 8, status: 'Low' },
  { id: 'SEG-004', name: 'Singida — Nzega', score: 62, status: 'High' },
  { id: 'SEG-005', name: 'Nzega — Isaka', score: 15, status: 'Low' },
  { id: 'SEG-006', name: 'Isaka — Ndola', score: 22, status: 'Low' },
];

export default function LeakDetection() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leak Detection</h1>
      <p className="text-sm text-muted-foreground">Fused ΔP/ΔQ + acoustic/ROW signals per pipeline segment</p>

      <div className="grid gap-4 md:grid-cols-3">
        <KPICard title="Active Alerts" value="1" subtitle="last 24h" trend="flat" trendValue="" icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Pipeline Coverage" value="98.5%" subtitle="sensors online" icon={<Shield className="h-5 w-5" />} />
        <KPICard title="Average Score" value="25.7" subtitle="across all segments" />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Segment Leak Probability Scores</h3>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          {SEGMENTS.map((seg) => (
            <div key={seg.id} className="text-center">
              <FraudScoreGauge score={seg.score} label={seg.id} />
              <p className="mt-1 text-xs text-muted-foreground">{seg.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Segment Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Segment</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-right font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {SEGMENTS.map((seg) => (
                <tr key={seg.id} className="border-b">
                  <td className="px-4 py-3 font-mono text-xs">{seg.id}</td>
                  <td className="px-4 py-3">{seg.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">{seg.score}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      seg.score >= 50 ? 'bg-red-100 text-red-800' :
                      seg.score >= 25 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>{seg.status}</span>
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
