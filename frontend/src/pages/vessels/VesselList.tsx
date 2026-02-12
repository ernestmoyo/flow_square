import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Ship, Filter } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import KPICard from '../../components/common/KPICard';
import DataTable from '../../components/tables/DataTable';
import { formatNumber } from '../../utils/formatters';
import { VESSEL_STATUSES } from '../../utils/constants';
import type { Vessel } from '../../types';

const DEMO_VESSELS: Vessel[] = [
  {
    id: 'v-001',
    name: 'MT Bonny Light',
    imo_number: '9801234',
    dwt: 115000,
    flag: 'NG',
    vessel_type: 'Crude Tanker',
    status: 'BERTHED',
    created_at: '2025-12-01T08:00:00Z',
    updated_at: '2026-02-10T14:30:00Z',
  },
  {
    id: 'v-002',
    name: 'MT Eagle Tide',
    imo_number: '9805678',
    dwt: 80000,
    flag: 'LR',
    vessel_type: 'Product Tanker',
    status: 'APPROACHING',
    created_at: '2025-11-15T10:00:00Z',
    updated_at: '2026-02-11T09:15:00Z',
  },
  {
    id: 'v-003',
    name: 'MT Delta Spirit',
    imo_number: '9812345',
    dwt: 155000,
    flag: 'MH',
    vessel_type: 'Crude Tanker',
    status: 'DISCHARGING',
    created_at: '2025-10-20T12:00:00Z',
    updated_at: '2026-02-12T06:00:00Z',
  },
  {
    id: 'v-004',
    name: 'MT Horizon Glory',
    imo_number: '9819876',
    dwt: 45000,
    flag: 'PA',
    vessel_type: 'Product Tanker',
    status: 'AT_ANCHOR',
    created_at: '2025-09-05T07:30:00Z',
    updated_at: '2026-02-11T22:45:00Z',
  },
  {
    id: 'v-005',
    name: 'MT Sea Pioneer',
    imo_number: '9823456',
    dwt: 130000,
    flag: 'SG',
    vessel_type: 'Crude Tanker',
    status: 'DEPARTED',
    created_at: '2025-08-12T16:00:00Z',
    updated_at: '2026-02-09T11:00:00Z',
  },
  {
    id: 'v-006',
    name: 'MT Coral Stream',
    imo_number: '9831122',
    dwt: 62000,
    flag: 'BS',
    vessel_type: 'Product Tanker',
    status: 'BERTHED',
    created_at: '2026-01-03T14:00:00Z',
    updated_at: '2026-02-12T08:30:00Z',
  },
  {
    id: 'v-007',
    name: 'MT Atlas Voyager',
    imo_number: '9837788',
    dwt: 98000,
    flag: 'GR',
    vessel_type: 'Crude Tanker',
    status: 'APPROACHING',
    created_at: '2026-01-18T09:00:00Z',
    updated_at: '2026-02-12T10:00:00Z',
  },
  {
    id: 'v-008',
    name: 'MT Pacific Wave',
    imo_number: '9845500',
    dwt: 73000,
    flag: 'HK',
    vessel_type: 'Product Tanker',
    status: 'DEPARTED',
    created_at: '2025-12-20T11:00:00Z',
    updated_at: '2026-02-08T17:20:00Z',
  },
];

const VESSEL_STATUS_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(VESSEL_STATUSES).map(([key, val]) => [key, val.color]),
);

export default function VesselList() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const timer = setTimeout(() => {
      setVessels(DEMO_VESSELS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredVessels = useMemo(() => {
    if (statusFilter === 'ALL') return vessels;
    return vessels.filter((v) => v.status === statusFilter);
  }, [vessels, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vessels.forEach((v) => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });
    return counts;
  }, [vessels]);

  const columns: ColumnDef<Vessel, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Vessel Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Ship className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    { accessorKey: 'imo_number', header: 'IMO Number' },
    { accessorKey: 'vessel_type', header: 'Type' },
    {
      accessorKey: 'dwt',
      header: 'DWT',
      cell: ({ getValue }) => {
        const val = getValue() as number | null;
        return val ? formatNumber(val) : '--';
      },
    },
    { accessorKey: 'flag', header: 'Flag' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <StatusBadge status={getValue() as string} colorMap={VESSEL_STATUS_COLORS} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vessels</h1>
        <p className="text-sm text-muted-foreground">Track vessel status across all terminals</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(VESSEL_STATUSES).map(([key, meta]) => (
          <KPICard
            key={key}
            title={meta.label}
            value={String(statusCounts[key] || 0)}
            subtitle="vessels"
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="ALL">All Statuses</option>
          {Object.entries(VESSEL_STATUSES).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          {filteredVessels.length} vessel{filteredVessels.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-3">Loading vessels...</span>
        </div>
      ) : (
        <DataTable data={filteredVessels} columns={columns} pageSize={10} />
      )}
    </div>
  );
}
