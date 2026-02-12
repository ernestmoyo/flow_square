import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Fuel, Activity, Clock, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import KPICard from '../../components/common/KPICard';
import DataTable from '../../components/tables/DataTable';
import { formatVolume, formatDateTime, formatNumber } from '../../utils/formatters';

interface GantryBay {
  id: string;
  bay_number: string;
  arm_count: number;
  status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
}

interface LoadingOperation {
  id: string;
  bay_id: string;
  bay_number: string;
  ticket_number: string;
  vehicle_reg: string;
  driver_name: string;
  product: string;
  preset_volume_litres: number;
  loaded_volume_litres: number;
  flow_rate_lpm: number;
  start_time: string;
  end_time: string | null;
  status: 'LOADING' | 'COMPLETED' | 'QUEUED' | 'STOPPED';
}

const BAY_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  IDLE: 'bg-gray-100 text-gray-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800',
};

const OP_STATUS_COLORS: Record<string, string> = {
  LOADING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  QUEUED: 'bg-yellow-100 text-yellow-800',
  STOPPED: 'bg-red-100 text-red-800',
};

const DEMO_BAYS: GantryBay[] = [
  { id: 'b-01', bay_number: 'Bay 1', arm_count: 3, status: 'ACTIVE' },
  { id: 'b-02', bay_number: 'Bay 2', arm_count: 3, status: 'ACTIVE' },
  { id: 'b-03', bay_number: 'Bay 3', arm_count: 2, status: 'ACTIVE' },
  { id: 'b-04', bay_number: 'Bay 4', arm_count: 3, status: 'IDLE' },
  { id: 'b-05', bay_number: 'Bay 5', arm_count: 2, status: 'MAINTENANCE' },
  { id: 'b-06', bay_number: 'Bay 6', arm_count: 3, status: 'ACTIVE' },
];

const DEMO_OPERATIONS: LoadingOperation[] = [
  {
    id: 'op-001', bay_id: 'b-01', bay_number: 'Bay 1', ticket_number: 'TK-20260212-001',
    vehicle_reg: 'LG-234-XYZ', driver_name: 'Akin Oladele', product: 'PMS',
    preset_volume_litres: 33000, loaded_volume_litres: 28500, flow_rate_lpm: 1200,
    start_time: '2026-02-12T07:30:00Z', end_time: null, status: 'LOADING',
  },
  {
    id: 'op-002', bay_id: 'b-02', bay_number: 'Bay 2', ticket_number: 'TK-20260212-002',
    vehicle_reg: 'AB-876-DEF', driver_name: 'Chidi Nwosu', product: 'AGO',
    preset_volume_litres: 45000, loaded_volume_litres: 45000, flow_rate_lpm: 0,
    start_time: '2026-02-12T06:15:00Z', end_time: '2026-02-12T07:45:00Z', status: 'COMPLETED',
  },
  {
    id: 'op-003', bay_id: 'b-03', bay_number: 'Bay 3', ticket_number: 'TK-20260212-003',
    vehicle_reg: 'KN-512-GHI', driver_name: 'Bayo Adeniyi', product: 'PMS',
    preset_volume_litres: 33000, loaded_volume_litres: 12100, flow_rate_lpm: 1150,
    start_time: '2026-02-12T08:00:00Z', end_time: null, status: 'LOADING',
  },
  {
    id: 'op-004', bay_id: 'b-06', bay_number: 'Bay 6', ticket_number: 'TK-20260212-004',
    vehicle_reg: 'OG-111-JKL', driver_name: 'Emeka Obi', product: 'DPK',
    preset_volume_litres: 20000, loaded_volume_litres: 19800, flow_rate_lpm: 980,
    start_time: '2026-02-12T07:00:00Z', end_time: null, status: 'LOADING',
  },
  {
    id: 'op-005', bay_id: 'b-01', bay_number: 'Bay 1', ticket_number: 'TK-20260212-005',
    vehicle_reg: 'RV-333-MNO', driver_name: 'Tunde Bakare', product: 'PMS',
    preset_volume_litres: 33000, loaded_volume_litres: 0, flow_rate_lpm: 0,
    start_time: '2026-02-12T09:00:00Z', end_time: null, status: 'QUEUED',
  },
  {
    id: 'op-006', bay_id: 'b-02', bay_number: 'Bay 2', ticket_number: 'TK-20260212-006',
    vehicle_reg: 'LA-555-PQR', driver_name: 'Ibrahim Sule', product: 'AGO',
    preset_volume_litres: 40000, loaded_volume_litres: 0, flow_rate_lpm: 0,
    start_time: '2026-02-12T09:15:00Z', end_time: null, status: 'QUEUED',
  },
  {
    id: 'op-007', bay_id: 'b-02', bay_number: 'Bay 2', ticket_number: 'TK-20260212-007',
    vehicle_reg: 'KD-789-STU', driver_name: 'Yusuf Musa', product: 'PMS',
    preset_volume_litres: 33000, loaded_volume_litres: 33000, flow_rate_lpm: 0,
    start_time: '2026-02-12T04:30:00Z', end_time: '2026-02-12T05:50:00Z', status: 'COMPLETED',
  },
  {
    id: 'op-008', bay_id: 'b-06', bay_number: 'Bay 6', ticket_number: 'TK-20260212-008',
    vehicle_reg: 'EN-222-VWX', driver_name: 'Segun Ajayi', product: 'AGO',
    preset_volume_litres: 45000, loaded_volume_litres: 6500, flow_rate_lpm: 0,
    start_time: '2026-02-12T08:20:00Z', end_time: '2026-02-12T08:35:00Z', status: 'STOPPED',
  },
];

function LoadingProgress({ loaded, preset }: { loaded: number; preset: number }) {
  const pct = preset > 0 ? (loaded / preset) * 100 : 0;
  return (
    <div className="w-32">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function LoadingOperations() {
  const [operations, setOperations] = useState<LoadingOperation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOperations(DEMO_OPERATIONS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const activeLoads = operations.filter((o) => o.status === 'LOADING');
  const completedToday = operations.filter((o) => o.status === 'COMPLETED');
  const totalLoadedToday = operations.reduce((sum, o) => sum + o.loaded_volume_litres, 0);
  const avgFlowRate = activeLoads.length > 0
    ? activeLoads.reduce((sum, o) => sum + o.flow_rate_lpm, 0) / activeLoads.length
    : 0;

  const columns: ColumnDef<LoadingOperation, unknown>[] = [
    { accessorKey: 'ticket_number', header: 'Ticket #' },
    { accessorKey: 'bay_number', header: 'Bay' },
    { accessorKey: 'vehicle_reg', header: 'Vehicle' },
    { accessorKey: 'driver_name', header: 'Driver' },
    { accessorKey: 'product', header: 'Product' },
    {
      accessorKey: 'preset_volume_litres',
      header: 'Preset (L)',
      cell: ({ getValue }) => formatNumber(getValue() as number),
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <LoadingProgress loaded={row.original.loaded_volume_litres} preset={row.original.preset_volume_litres} />
      ),
    },
    {
      accessorKey: 'flow_rate_lpm',
      header: 'Flow (L/min)',
      cell: ({ getValue }) => {
        const val = getValue() as number;
        return val > 0 ? formatNumber(val) : '--';
      },
    },
    {
      accessorKey: 'start_time',
      header: 'Start',
      cell: ({ getValue }) => formatDateTime(getValue() as string),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <StatusBadge status={getValue() as string} colorMap={OP_STATUS_COLORS} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Loading Operations</h1>
        <p className="text-sm text-muted-foreground">Live gantry bay status and truck loading progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Active Loads"
          value={String(activeLoads.length)}
          subtitle={`across ${DEMO_BAYS.filter((b) => b.status === 'ACTIVE').length} active bays`}
          icon={<Activity className="h-5 w-5" />}
        />
        <KPICard
          title="Completed Today"
          value={String(completedToday.length)}
          subtitle="trucks loaded"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KPICard
          title="Total Loaded"
          value={formatVolume(totalLoadedToday, 'L')}
          subtitle="today's throughput"
          icon={<Fuel className="h-5 w-5" />}
        />
        <KPICard
          title="Avg Flow Rate"
          value={avgFlowRate > 0 ? `${formatNumber(avgFlowRate)} L/min` : '--'}
          subtitle="active arms"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Bay status cards */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Gantry Bay Status</h3>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {DEMO_BAYS.map((bay) => {
            const bayOps = operations.filter((o) => o.bay_id === bay.id && o.status === 'LOADING');
            return (
              <div
                key={bay.id}
                className={`rounded-lg border p-4 transition-shadow hover:shadow-md ${
                  bay.status === 'ACTIVE' && bayOps.length > 0
                    ? 'border-blue-300 bg-blue-50/50'
                    : bay.status === 'MAINTENANCE'
                      ? 'border-yellow-300 bg-yellow-50/50'
                      : bay.status === 'OUT_OF_SERVICE'
                        ? 'border-red-300 bg-red-50/30'
                        : 'bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{bay.bay_number}</span>
                  <StatusBadge status={bay.status} colorMap={BAY_STATUS_COLORS} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{bay.arm_count} loading arms</div>
                {bayOps.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {bayOps.map((op) => (
                      <div key={op.id} className="text-xs">
                        <span className="font-medium">{op.vehicle_reg}</span>
                        <span className="ml-1 text-muted-foreground">
                          {op.product} - {((op.loaded_volume_litres / op.preset_volume_litres) * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {bay.status === 'ACTIVE' && bayOps.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground italic">Ready for next truck</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Operations table */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Today&apos;s Loading Operations</h3>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="ml-3">Loading operations data...</span>
          </div>
        ) : (
          <DataTable data={operations} columns={columns} pageSize={10} />
        )}
      </div>
    </div>
  );
}
