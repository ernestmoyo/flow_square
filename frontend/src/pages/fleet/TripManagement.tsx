import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Route, Filter, Package, Clock } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import KPICard from '../../components/common/KPICard';
import DataTable from '../../components/tables/DataTable';
import { formatVolume, formatDateTime } from '../../utils/formatters';
import { TRIP_STATUSES } from '../../utils/constants';
import type { Trip } from '../../types';

interface TripRow extends Trip {
  vehicle_reg: string;
  driver_name: string;
  origin_name: string;
}

const TRIP_STATUS_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(TRIP_STATUSES).map(([key, val]) => [key, val.color]),
);

const DEMO_TRIPS: TripRow[] = [
  {
    id: 'tr-001', vehicle_id: 'vh-001', vehicle_reg: 'LG-234-XYZ', driver_name: 'Akin Oladele',
    origin_terminal_id: 'term-01', origin_name: 'Apapa Terminal',
    destination_name: 'Ibadan Depot', destination_lat: 7.3775, destination_lon: 3.9470,
    status: 'EN_ROUTE', loaded_volume_litres: 33000, gantry_metered_litres: 33050,
    departure_time: '2026-02-12T08:15:00Z', arrival_time: null,
    ticket_number: 'TK-20260212-001', created_at: '2026-02-12T07:30:00Z',
  },
  {
    id: 'tr-002', vehicle_id: 'vh-002', vehicle_reg: 'AB-876-DEF', driver_name: 'Chidi Nwosu',
    origin_terminal_id: 'term-01', origin_name: 'Apapa Terminal',
    destination_name: 'Ore Station', destination_lat: 6.7494, destination_lon: 4.8753,
    status: 'DELIVERED', loaded_volume_litres: 45000, gantry_metered_litres: 45020,
    departure_time: '2026-02-12T06:00:00Z', arrival_time: '2026-02-12T09:30:00Z',
    ticket_number: 'TK-20260212-002', created_at: '2026-02-12T05:30:00Z',
  },
  {
    id: 'tr-003', vehicle_id: 'vh-003', vehicle_reg: 'KN-512-GHI', driver_name: 'Bayo Adeniyi',
    origin_terminal_id: 'term-02', origin_name: 'Tin Can Terminal',
    destination_name: 'Ilorin Depot', destination_lat: 8.4799, destination_lon: 4.5418,
    status: 'SCHEDULED', loaded_volume_litres: null, gantry_metered_litres: null,
    departure_time: null, arrival_time: null,
    ticket_number: 'TK-20260212-003', created_at: '2026-02-12T08:00:00Z',
  },
  {
    id: 'tr-004', vehicle_id: 'vh-004', vehicle_reg: 'OG-111-JKL', driver_name: 'Emeka Obi',
    origin_terminal_id: 'term-01', origin_name: 'Apapa Terminal',
    destination_name: 'Benin Depot', destination_lat: 6.3350, destination_lon: 5.6037,
    status: 'EN_ROUTE', loaded_volume_litres: 20000, gantry_metered_litres: 20010,
    departure_time: '2026-02-12T07:45:00Z', arrival_time: null,
    ticket_number: 'TK-20260212-004', created_at: '2026-02-12T07:00:00Z',
  },
  {
    id: 'tr-005', vehicle_id: 'vh-005', vehicle_reg: 'RV-333-MNO', driver_name: 'Tunde Bakare',
    origin_terminal_id: 'term-01', origin_name: 'Apapa Terminal',
    destination_name: 'Sagamu Depot', destination_lat: 6.8427, destination_lon: 3.6293,
    status: 'AT_DESTINATION', loaded_volume_litres: 33000, gantry_metered_litres: 33040,
    departure_time: '2026-02-12T05:00:00Z', arrival_time: '2026-02-12T07:30:00Z',
    ticket_number: 'TK-20260212-005', created_at: '2026-02-12T04:30:00Z',
  },
  {
    id: 'tr-006', vehicle_id: 'vh-006', vehicle_reg: 'LA-555-PQR', driver_name: 'Ibrahim Sule',
    origin_terminal_id: 'term-02', origin_name: 'Tin Can Terminal',
    destination_name: 'Abeokuta Station', destination_lat: 7.1557, destination_lon: 3.3450,
    status: 'DELIVERED', loaded_volume_litres: 40000, gantry_metered_litres: 40015,
    departure_time: '2026-02-12T04:00:00Z', arrival_time: '2026-02-12T06:45:00Z',
    ticket_number: 'TK-20260212-006', created_at: '2026-02-12T03:30:00Z',
  },
  {
    id: 'tr-007', vehicle_id: 'vh-009', vehicle_reg: 'PH-444-ABC', driver_name: 'Aminu Garba',
    origin_terminal_id: 'term-01', origin_name: 'Apapa Terminal',
    destination_name: 'Oshogbo Depot', destination_lat: 7.7827, destination_lon: 4.5418,
    status: 'EN_ROUTE', loaded_volume_litres: 33000, gantry_metered_litres: 33030,
    departure_time: '2026-02-12T09:00:00Z', arrival_time: null,
    ticket_number: 'TK-20260212-007', created_at: '2026-02-12T08:30:00Z',
  },
  {
    id: 'tr-008', vehicle_id: 'vh-010', vehicle_reg: 'IM-667-DEF', driver_name: 'Kola Afolabi',
    origin_terminal_id: 'term-02', origin_name: 'Tin Can Terminal',
    destination_name: 'Ikorodu Depot', destination_lat: 6.6194, destination_lon: 3.5105,
    status: 'CANCELLED', loaded_volume_litres: null, gantry_metered_litres: null,
    departure_time: null, arrival_time: null,
    ticket_number: 'TK-20260212-008', created_at: '2026-02-12T06:00:00Z',
  },
];

export default function TripManagement() {
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const timer = setTimeout(() => {
      setTrips(DEMO_TRIPS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredTrips = useMemo(() => {
    if (statusFilter === 'ALL') return trips;
    return trips.filter((t) => t.status === statusFilter);
  }, [trips, statusFilter]);

  const statusCounts: Record<string, number> = {};
  trips.forEach((t) => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });

  const totalDispatched = trips
    .filter((t) => t.loaded_volume_litres !== null)
    .reduce((sum, t) => sum + (t.loaded_volume_litres || 0), 0);

  const columns: ColumnDef<TripRow, unknown>[] = [
    {
      accessorKey: 'ticket_number',
      header: 'Ticket #',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'vehicle_reg',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <span className="font-medium">{row.original.vehicle_reg}</span>
          <p className="text-xs text-muted-foreground">{row.original.driver_name}</p>
        </div>
      ),
    },
    { accessorKey: 'origin_name', header: 'Origin' },
    { accessorKey: 'destination_name', header: 'Destination' },
    {
      accessorKey: 'loaded_volume_litres',
      header: 'Loaded (L)',
      cell: ({ getValue }) => {
        const val = getValue() as number | null;
        return val !== null ? formatVolume(val, 'L') : '--';
      },
    },
    {
      accessorKey: 'gantry_metered_litres',
      header: 'Gantry (L)',
      cell: ({ getValue }) => {
        const val = getValue() as number | null;
        return val !== null ? formatVolume(val, 'L') : '--';
      },
    },
    {
      accessorKey: 'departure_time',
      header: 'Departure',
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return val ? formatDateTime(val) : '--';
      },
    },
    {
      accessorKey: 'arrival_time',
      header: 'Arrival',
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return val ? formatDateTime(val) : '--';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <StatusBadge status={getValue() as string} colorMap={TRIP_STATUS_COLORS} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trip Management</h1>
        <p className="text-sm text-muted-foreground">Track dispatched trips, volumes, and delivery status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total Trips Today"
          value={String(trips.length)}
          subtitle="dispatched"
          icon={<Route className="h-5 w-5" />}
        />
        <KPICard
          title="En Route"
          value={String(statusCounts['EN_ROUTE'] || 0)}
          subtitle="in transit"
          icon={<Clock className="h-5 w-5" />}
        />
        <KPICard
          title="Delivered"
          value={String(statusCounts['DELIVERED'] || 0)}
          subtitle="completed"
          trend="up"
          trendValue="3"
          trendPositive
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          title="Volume Dispatched"
          value={formatVolume(totalDispatched, 'L')}
          subtitle="today's total"
        />
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="ALL">All Statuses</option>
          {Object.entries(TRIP_STATUSES).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-3">Loading trips...</span>
        </div>
      ) : (
        <DataTable data={filteredTrips} columns={columns} pageSize={10} />
      )}
    </div>
  );
}
