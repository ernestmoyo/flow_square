import KPICard from '../../components/common/KPICard';
import FraudScoreGauge from '../../components/charts/FraudScoreGauge';
import StatusBadge from '../../components/common/StatusBadge';
import { ShieldAlert, TrendingDown } from 'lucide-react';

const DEMO_TRIPS = [
  { id: 'TRP-001', vehicle: 'T 412 DLT', score: 5, flags: [], destination: 'Dodoma Depot' },
  { id: 'TRP-002', vehicle: 'T 089 KMJ', score: 72, flags: ['SHORT_LOAD', 'OFF_ROUTE'], destination: 'Morogoro Station' },
  { id: 'TRP-003', vehicle: 'T 221 DSM', score: 0, flags: [], destination: 'Iringa Depot' },
  { id: 'TRP-004', vehicle: 'T 556 ARU', score: 45, flags: ['GHOST_TRIP'], destination: 'Mwanza Terminal' },
  { id: 'TRP-005', vehicle: 'T 338 MBY', score: 15, flags: [], destination: 'Tabora Station' },
  { id: 'TRP-006', vehicle: 'T 712 DLT', score: 88, flags: ['SHORT_LOAD', 'DUPLICATE_TICKET'], destination: 'Arusha Depot' },
];

export default function FraudMonitoring() {
  const highRiskCount = DEMO_TRIPS.filter((t) => t.score >= 50).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fraud Monitoring</h1>
      <p className="text-sm text-muted-foreground">Behavioural anomalies: short-load, ghost trips, duplicate tickets, off-route</p>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="High Risk Trips" value={String(highRiskCount)} subtitle="last 7 days" trend="down" trendValue="33%" trendPositive icon={<ShieldAlert className="h-5 w-5" />} />
        <KPICard title="Fraud Detection Rate" value="94%" subtitle="vs 60% pre-platform" />
        <KPICard title="False Positive Rate" value="3.2%" subtitle="improving" trend="down" trendValue="1.1%" trendPositive />
        <KPICard title="Savings" value="$127,400" subtitle="fraud prevented (30d)" icon={<TrendingDown className="h-5 w-5" />} />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Trip Fraud Scores</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Trip</th>
                <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium">Destination</th>
                <th className="px-4 py-3 text-center font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">Flags</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_TRIPS.map((trip) => (
                <tr key={trip.id} className="border-b">
                  <td className="px-4 py-3 font-mono text-xs">{trip.id}</td>
                  <td className="px-4 py-3">{trip.vehicle}</td>
                  <td className="px-4 py-3">{trip.destination}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${trip.score >= 75 ? 'text-red-600' : trip.score >= 50 ? 'text-orange-600' : trip.score >= 25 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {trip.score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {trip.flags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Clean</span>
                      ) : (
                        trip.flags.map((flag) => (
                          <StatusBadge key={flag} status={flag} colorMap={{ SHORT_LOAD: 'bg-red-100 text-red-800', GHOST_TRIP: 'bg-purple-100 text-purple-800', DUPLICATE_TICKET: 'bg-orange-100 text-orange-800', OFF_ROUTE: 'bg-yellow-100 text-yellow-800' }} />
                        ))
                      )}
                    </div>
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
