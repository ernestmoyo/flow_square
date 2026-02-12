import { Activity, AlertTriangle, Droplets, Ship, Waves } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import UFGTrendChart from '../../components/charts/UFGTrendChart';
import FraudScoreGauge from '../../components/charts/FraudScoreGauge';
import { formatVolume, formatPercentage } from '../../utils/formatters';

// ---------------------------------------------------------------------------
// Demo / placeholder data
// ---------------------------------------------------------------------------

const liveFlowData = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const min = (i % 2) * 30;
  return {
    time: `2026-02-12T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00Z`,
    value: 2400 + Math.sin(i / 4) * 300 + Math.random() * 80,
  };
});

const pressureData = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const min = (i % 2) * 30;
  return {
    time: `2026-02-12T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00Z`,
    value: 65 + Math.sin(i / 6) * 5 + Math.random() * 2,
  };
});

const ufgTrendData = [
  { date: '06 Feb', ufg_pct: 0.82 },
  { date: '07 Feb', ufg_pct: 0.91 },
  { date: '08 Feb', ufg_pct: 1.04 },
  { date: '09 Feb', ufg_pct: 0.77 },
  { date: '10 Feb', ufg_pct: 1.22 },
  { date: '11 Feb', ufg_pct: 1.38 },
  { date: '12 Feb', ufg_pct: 1.15 },
];

interface VesselProgress {
  name: string;
  cargo: string;
  progress: number;
  volume_m3: number;
  target_m3: number;
}

const vesselDischarge: VesselProgress[] = [
  { name: 'MT Bonny River', cargo: 'Crude', progress: 87, volume_m3: 130500, target_m3: 150000 },
  { name: 'MT Escravos', cargo: 'Condensate', progress: 42, volume_m3: 33600, target_m3: 80000 },
  { name: 'MT Forcados', cargo: 'Crude', progress: 5, volume_m3: 6000, target_m3: 120000 },
];

interface AlarmRow {
  id: string;
  tag: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  time: string;
}

const activeAlarms: AlarmRow[] = [
  { id: 'ALM-0041', tag: 'FT-101', description: 'Flow deviation > 5% on Trunk Line A', severity: 'HIGH', time: '08:14' },
  { id: 'ALM-0039', tag: 'PT-203', description: 'Pressure spike at Manifold B', severity: 'CRITICAL', time: '07:52' },
  { id: 'ALM-0038', tag: 'LT-005', description: 'Tank 5 low level warning', severity: 'MEDIUM', time: '07:30' },
  { id: 'ALM-0036', tag: 'TT-112', description: 'Temperature above threshold', severity: 'LOW', time: '06:45' },
];

const SEVERITY_COLORS: Record<AlarmRow['severity'], string> = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-blue-100 text-blue-800',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ControlRoom() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Control Room</h1>
        <p className="text-sm text-muted-foreground">
          Real-time operational overview &mdash; live flows, alarms &amp; vessel activity
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Live Flow Rate"
          value={formatVolume(2435, 'm\u00B3/h')}
          trend="up"
          trendValue="+3.2%"
          trendPositive
          icon={<Waves className="h-5 w-5" />}
        />
        <KPICard
          title="Active Alarms"
          value="4"
          subtitle="2 critical"
          trend="up"
          trendValue="+1"
          trendPositive={false}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <KPICard
          title="Leak Probability"
          value={formatPercentage(12.4)}
          subtitle="Trunk Line A"
          trend="down"
          trendValue="-2.1%"
          trendPositive
          icon={<Droplets className="h-5 w-5" />}
        />
        <KPICard
          title="Today's UFG"
          value={formatPercentage(1.15)}
          subtitle="Within tolerance"
          trend="down"
          trendValue="-0.23%"
          trendPositive
          icon={<Activity className="h-5 w-5" />}
        />
        <KPICard
          title="Vessels Discharging"
          value="3"
          subtitle="1 critical path"
          trend="flat"
          trendValue="stable"
          icon={<Ship className="h-5 w-5" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <TimeSeriesChart
            data={liveFlowData}
            title="Live Flow Rate (m\u00B3/h)"
            unit="m\u00B3/h"
            color="#3b82f6"
            height={260}
          />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <TimeSeriesChart
            data={pressureData}
            title="Pipeline Pressure (bar)"
            unit="bar"
            color="#8b5cf6"
            height={260}
          />
        </div>
      </div>

      {/* UFG Trend & Leak Gauge */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 lg:col-span-2">
          <UFGTrendChart data={ufgTrendData} threshold={1.5} height={260} />
        </div>
        <div className="flex items-center justify-center rounded-lg border bg-card p-4">
          <FraudScoreGauge score={12} label="Leak Probability Score" />
        </div>
      </div>

      {/* Bottom row: Active Alarms & Vessel Discharge Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Alarms */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Active Alarms</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2 pr-4">Tag</th>
                  <th className="pb-2 pr-4">Description</th>
                  <th className="pb-2 pr-4">Severity</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {activeAlarms.map((alarm) => (
                  <tr key={alarm.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{alarm.id}</td>
                    <td className="py-2 pr-4 font-mono">{alarm.tag}</td>
                    <td className="py-2 pr-4">{alarm.description}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[alarm.severity]}`}>
                        {alarm.severity}
                      </span>
                    </td>
                    <td className="py-2 text-muted-foreground">{alarm.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vessel Discharge Progress */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            Vessel Discharge Progress
          </h3>
          <div className="space-y-5">
            {vesselDischarge.map((v) => (
              <div key={v.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{v.name}</span>
                  <span className="text-muted-foreground">
                    {formatVolume(v.volume_m3)} / {formatVolume(v.target_m3)} &mdash; {v.cargo}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      v.progress >= 80
                        ? 'bg-green-500'
                        : v.progress >= 40
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                    }`}
                    style={{ width: `${v.progress}%` }}
                  />
                </div>
                <p className="mt-0.5 text-right text-xs text-muted-foreground">
                  {v.progress}% complete
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
