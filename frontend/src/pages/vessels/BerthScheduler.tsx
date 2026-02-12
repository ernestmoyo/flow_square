import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Anchor, Calendar, Clock } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import KPICard from '../../components/common/KPICard';
import DataTable from '../../components/tables/DataTable';
import { formatDateTime, formatVolume } from '../../utils/formatters';
import { VESSEL_STATUSES } from '../../utils/constants';
import type { BerthSchedule } from '../../types';

interface BerthScheduleRow extends BerthSchedule {
  vessel_name: string;
  vessel_status: string;
}

const DEMO_SCHEDULES: BerthScheduleRow[] = [
  {
    id: 'bs-001',
    vessel_id: 'v-001',
    vessel_name: 'MT Bonny Light',
    vessel_status: 'BERTHED',
    berth_name: 'Berth A-1',
    eta: '2026-02-10T06:00:00Z',
    ata: '2026-02-10T07:15:00Z',
    etd: '2026-02-13T18:00:00Z',
    atd: null,
    cargo_type: 'Bonny Light Crude',
    cargo_volume_m3: 85000,
    bill_of_lading_volume_m3: 84800,
    metered_volume_m3: 84650,
    created_at: '2026-02-08T10:00:00Z',
  },
  {
    id: 'bs-002',
    vessel_id: 'v-003',
    vessel_name: 'MT Delta Spirit',
    vessel_status: 'DISCHARGING',
    berth_name: 'Berth B-2',
    eta: '2026-02-11T14:00:00Z',
    ata: '2026-02-11T15:30:00Z',
    etd: '2026-02-15T10:00:00Z',
    atd: null,
    cargo_type: 'Forcados Blend',
    cargo_volume_m3: 120000,
    bill_of_lading_volume_m3: 119500,
    metered_volume_m3: null,
    created_at: '2026-02-09T12:00:00Z',
  },
  {
    id: 'bs-003',
    vessel_id: 'v-002',
    vessel_name: 'MT Eagle Tide',
    vessel_status: 'APPROACHING',
    berth_name: 'Berth A-2',
    eta: '2026-02-13T08:00:00Z',
    ata: null,
    etd: '2026-02-16T22:00:00Z',
    atd: null,
    cargo_type: 'PMS',
    cargo_volume_m3: 55000,
    bill_of_lading_volume_m3: 55000,
    metered_volume_m3: null,
    created_at: '2026-02-10T08:00:00Z',
  },
  {
    id: 'bs-004',
    vessel_id: 'v-004',
    vessel_name: 'MT Horizon Glory',
    vessel_status: 'AT_ANCHOR',
    berth_name: 'Berth A-1',
    eta: '2026-02-14T12:00:00Z',
    ata: null,
    etd: '2026-02-17T06:00:00Z',
    atd: null,
    cargo_type: 'AGO',
    cargo_volume_m3: 38000,
    bill_of_lading_volume_m3: 38000,
    metered_volume_m3: null,
    created_at: '2026-02-11T09:00:00Z',
  },
  {
    id: 'bs-005',
    vessel_id: 'v-005',
    vessel_name: 'MT Sea Pioneer',
    vessel_status: 'DEPARTED',
    berth_name: 'Berth B-1',
    eta: '2026-02-06T10:00:00Z',
    ata: '2026-02-06T11:20:00Z',
    etd: '2026-02-09T08:00:00Z',
    atd: '2026-02-09T09:45:00Z',
    cargo_type: 'Qua Iboe Crude',
    cargo_volume_m3: 100000,
    bill_of_lading_volume_m3: 99800,
    metered_volume_m3: 99550,
    created_at: '2026-02-04T14:00:00Z',
  },
  {
    id: 'bs-006',
    vessel_id: 'v-006',
    vessel_name: 'MT Coral Stream',
    vessel_status: 'BERTHED',
    berth_name: 'Berth C-1',
    eta: '2026-02-11T20:00:00Z',
    ata: '2026-02-11T21:10:00Z',
    etd: '2026-02-14T14:00:00Z',
    atd: null,
    cargo_type: 'DPK',
    cargo_volume_m3: 42000,
    bill_of_lading_volume_m3: 42000,
    metered_volume_m3: 41850,
    created_at: '2026-02-10T16:00:00Z',
  },
];

const BERTHS = ['Berth A-1', 'Berth A-2', 'Berth B-1', 'Berth B-2', 'Berth C-1'];

const VESSEL_STATUS_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(VESSEL_STATUSES).map(([key, val]) => [key, val.color]),
);

// Build a simple 7-day timeline range for the Gantt-style visual
const today = new Date();
const TIMELINE_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() - 2 + i);
  return d;
});

function dayLabel(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
}

function barPosition(eta: string, etd: string | null) {
  const start = new Date(eta);
  const end = etd ? new Date(etd) : new Date(start.getTime() + 3 * 86400000);
  const rangeStart = TIMELINE_DAYS[0].getTime();
  const rangeEnd = TIMELINE_DAYS[TIMELINE_DAYS.length - 1].getTime() + 86400000;
  const totalMs = rangeEnd - rangeStart;

  const leftPct = Math.max(0, ((start.getTime() - rangeStart) / totalMs) * 100);
  const widthPct = Math.min(100 - leftPct, ((end.getTime() - start.getTime()) / totalMs) * 100);
  return { left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` };
}

export default function BerthScheduler() {
  const activeSchedules = DEMO_SCHEDULES.filter((s) => s.vessel_status !== 'DEPARTED');

  const columns: ColumnDef<BerthScheduleRow, unknown>[] = [
    {
      accessorKey: 'vessel_name',
      header: 'Vessel',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Anchor className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.vessel_name}</span>
        </div>
      ),
    },
    { accessorKey: 'berth_name', header: 'Berth' },
    { accessorKey: 'cargo_type', header: 'Cargo' },
    {
      accessorKey: 'cargo_volume_m3',
      header: 'Volume',
      cell: ({ getValue }) => {
        const val = getValue() as number | null;
        return val ? formatVolume(val) : '--';
      },
    },
    {
      accessorKey: 'eta',
      header: 'ETA',
      cell: ({ getValue }) => formatDateTime(getValue() as string),
    },
    {
      accessorKey: 'ata',
      header: 'ATA',
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return val ? formatDateTime(val) : '--';
      },
    },
    {
      accessorKey: 'etd',
      header: 'ETD',
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return val ? formatDateTime(val) : '--';
      },
    },
    {
      accessorKey: 'vessel_status',
      header: 'Status',
      cell: ({ getValue }) => (
        <StatusBadge status={getValue() as string} colorMap={VESSEL_STATUS_COLORS} />
      ),
    },
  ];

  const berthColorMap: Record<string, string> = {
    'Berth A-1': 'bg-blue-500',
    'Berth A-2': 'bg-indigo-500',
    'Berth B-1': 'bg-emerald-500',
    'Berth B-2': 'bg-teal-500',
    'Berth C-1': 'bg-amber-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Berth Scheduler</h1>
        <p className="text-sm text-muted-foreground">Scheduled vessel arrivals, berth assignments, and departures</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Active Berths"
          value={`${DEMO_SCHEDULES.filter((s) => s.vessel_status === 'BERTHED' || s.vessel_status === 'DISCHARGING').length} / ${BERTHS.length}`}
          subtitle="currently occupied"
          icon={<Anchor className="h-5 w-5" />}
        />
        <KPICard
          title="Approaching"
          value={String(DEMO_SCHEDULES.filter((s) => s.vessel_status === 'APPROACHING').length)}
          subtitle="inbound vessels"
          icon={<Clock className="h-5 w-5" />}
        />
        <KPICard
          title="At Anchor"
          value={String(DEMO_SCHEDULES.filter((s) => s.vessel_status === 'AT_ANCHOR').length)}
          subtitle="awaiting berth"
        />
        <KPICard
          title="This Week Volume"
          value={formatVolume(DEMO_SCHEDULES.reduce((sum, s) => sum + (s.cargo_volume_m3 || 0), 0))}
          subtitle="total scheduled"
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      {/* Timeline / Gantt view */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Berth Timeline (7-Day View)</h3>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex">
            <div className="w-28 shrink-0 text-xs font-medium text-muted-foreground">Berth</div>
            <div className="relative flex flex-1">
              {TIMELINE_DAYS.map((d, i) => (
                <div key={i} className="flex-1 border-l px-1 text-xs text-muted-foreground">
                  {dayLabel(d)}
                </div>
              ))}
            </div>
          </div>
          {/* Rows per berth */}
          {BERTHS.map((berth) => {
            const berthSchedules = DEMO_SCHEDULES.filter((s) => s.berth_name === berth);
            return (
              <div key={berth} className="flex items-center">
                <div className="w-28 shrink-0 text-sm font-medium">{berth}</div>
                <div className="relative h-8 flex-1 rounded bg-muted/30">
                  {berthSchedules.map((s) => {
                    const pos = barPosition(s.eta, s.etd);
                    return (
                      <div
                        key={s.id}
                        title={`${s.vessel_name} - ${s.cargo_type}`}
                        className={`absolute top-1 h-6 rounded ${berthColorMap[berth] || 'bg-gray-500'} cursor-pointer opacity-85 hover:opacity-100 transition-opacity`}
                        style={{ left: pos.left, width: pos.width }}
                      >
                        <span className="truncate px-2 text-xs font-medium leading-6 text-white">
                          {s.vessel_name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail table */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">All Scheduled Berths</h3>
        <DataTable data={DEMO_SCHEDULES} columns={columns} pageSize={10} />
      </div>
    </div>
  );
}
