import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Truck, MapPin, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import KPICard from '../../components/common/KPICard';
import DataTable from '../../components/tables/DataTable';
import { formatNumber, formatDateTime } from '../../utils/formatters';
import type { Vehicle } from '../../types';

const VEHICLE_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  EN_ROUTE: 'bg-blue-100 text-blue-800',
  LOADING: 'bg-yellow-100 text-yellow-800',
  OFFLOADING: 'bg-purple-100 text-purple-800',
  MAINTENANCE: 'bg-orange-100 text-orange-800',
};

const DEMO_VEHICLES: Vehicle[] = [
  { id: 'vh-001', registration_number: 'LG-234-XYZ', asset_id: 'a-t01', driver_name: 'Akin Oladele', driver_phone: '+234-801-234-5678', capacity_litres: 33000, compartments: 4, current_lat: 6.4541, current_lon: 3.3947, last_gps_time: '2026-02-12T09:55:00Z', status: 'EN_ROUTE', created_at: '2025-06-01T00:00:00Z' },
  { id: 'vh-002', registration_number: 'AB-876-DEF', asset_id: 'a-t02', driver_name: 'Chidi Nwosu', driver_phone: '+234-802-345-6789', capacity_litres: 45000, compartments: 6, current_lat: 6.5244, current_lon: 3.3792, last_gps_time: '2026-02-12T09:58:00Z', status: 'ACTIVE', created_at: '2025-06-01T00:00:00Z' },
  { id: 'vh-003', registration_number: 'KN-512-GHI', asset_id: 'a-t03', driver_name: 'Bayo Adeniyi', driver_phone: '+234-803-456-7890', capacity_litres: 33000, compartments: 4, current_lat: 6.4450, current_lon: 3.4100, last_gps_time: '2026-02-12T09:50:00Z', status: 'LOADING', created_at: '2025-07-15T00:00:00Z' },
  { id: 'vh-004', registration_number: 'OG-111-JKL', asset_id: 'a-t04', driver_name: 'Emeka Obi', driver_phone: '+234-804-567-8901', capacity_litres: 20000, compartments: 3, current_lat: 6.5955, current_lon: 3.3421, last_gps_time: '2026-02-12T09:52:00Z', status: 'EN_ROUTE', created_at: '2025-08-01T00:00:00Z' },
  { id: 'vh-005', registration_number: 'RV-333-MNO', asset_id: 'a-t05', driver_name: 'Tunde Bakare', driver_phone: '+234-805-678-9012', capacity_litres: 33000, compartments: 4, current_lat: 6.4310, current_lon: 3.4250, last_gps_time: '2026-02-12T09:40:00Z', status: 'ACTIVE', created_at: '2025-09-01T00:00:00Z' },
  { id: 'vh-006', registration_number: 'LA-555-PQR', asset_id: 'a-t06', driver_name: 'Ibrahim Sule', driver_phone: '+234-806-789-0123', capacity_litres: 40000, compartments: 5, current_lat: 6.4600, current_lon: 3.3500, last_gps_time: '2026-02-12T09:30:00Z', status: 'OFFLOADING', created_at: '2025-10-01T00:00:00Z' },
  { id: 'vh-007', registration_number: 'KD-789-STU', asset_id: 'a-t07', driver_name: 'Yusuf Musa', driver_phone: '+234-807-890-1234', capacity_litres: 33000, compartments: 4, current_lat: null, current_lon: null, last_gps_time: '2026-02-11T18:00:00Z', status: 'INACTIVE', created_at: '2025-11-01T00:00:00Z' },
  { id: 'vh-008', registration_number: 'EN-222-VWX', asset_id: 'a-t08', driver_name: 'Segun Ajayi', driver_phone: '+234-808-901-2345', capacity_litres: 45000, compartments: 6, current_lat: null, current_lon: null, last_gps_time: null, status: 'MAINTENANCE', created_at: '2025-12-01T00:00:00Z' },
  { id: 'vh-009', registration_number: 'PH-444-ABC', asset_id: 'a-t09', driver_name: 'Aminu Garba', driver_phone: '+234-809-012-3456', capacity_litres: 33000, compartments: 4, current_lat: 6.4900, current_lon: 3.3600, last_gps_time: '2026-02-12T09:57:00Z', status: 'EN_ROUTE', created_at: '2025-12-15T00:00:00Z' },
  { id: 'vh-010', registration_number: 'IM-667-DEF', asset_id: 'a-t10', driver_name: 'Kola Afolabi', driver_phone: '+234-810-123-4567', capacity_litres: 20000, compartments: 3, current_lat: 6.5100, current_lon: 3.3800, last_gps_time: '2026-02-12T09:56:00Z', status: 'ACTIVE', created_at: '2026-01-01T00:00:00Z' },
];

export default function FleetOverview() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVehicles(DEMO_VEHICLES);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const statusCounts: Record<string, number> = {};
  vehicles.forEach((v) => {
    statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
  });

  const gpsConnected = vehicles.filter((v) => v.last_gps_time && v.current_lat !== null).length;
  const totalCapacity = vehicles.reduce((sum, v) => sum + (v.capacity_litres || 0), 0);

  const columns: ColumnDef<Vehicle, unknown>[] = [
    {
      accessorKey: 'registration_number',
      header: 'Registration',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.registration_number}</span>
        </div>
      ),
    },
    { accessorKey: 'driver_name', header: 'Driver' },
    {
      accessorKey: 'capacity_litres',
      header: 'Capacity (L)',
      cell: ({ getValue }) => {
        const val = getValue() as number | null;
        return val ? formatNumber(val) : '--';
      },
    },
    {
      accessorKey: 'compartments',
      header: 'Compartments',
    },
    {
      id: 'gps',
      header: 'GPS',
      cell: ({ row }) => {
        const hasGps = row.original.current_lat !== null;
        return hasGps ? (
          <span className="flex items-center gap-1 text-green-600">
            <Wifi className="h-3.5 w-3.5" /> Connected
          </span>
        ) : (
          <span className="flex items-center gap-1 text-muted-foreground">
            <WifiOff className="h-3.5 w-3.5" /> Offline
          </span>
        );
      },
    },
    {
      accessorKey: 'last_gps_time',
      header: 'Last GPS Signal',
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        return val ? formatDateTime(val) : '--';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <StatusBadge status={getValue() as string} colorMap={VEHICLE_STATUS_COLORS} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fleet Overview</h1>
        <p className="text-sm text-muted-foreground">Vehicle fleet status, GPS tracking, and capacity summary</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <KPICard
          title="Total Vehicles"
          value={String(vehicles.length)}
          subtitle="registered fleet"
          icon={<Truck className="h-5 w-5" />}
        />
        <KPICard
          title="En Route"
          value={String(statusCounts['EN_ROUTE'] || 0)}
          subtitle="currently on road"
          trend="up"
          trendValue="2"
          trendPositive
        />
        <KPICard
          title="GPS Connected"
          value={`${gpsConnected} / ${vehicles.length}`}
          subtitle="live tracking"
          icon={gpsConnected < vehicles.length ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : <Wifi className="h-5 w-5" />}
        />
        <KPICard
          title="Fleet Capacity"
          value={`${formatNumber(totalCapacity)} L`}
          subtitle="total capacity"
        />
        <KPICard
          title="In Maintenance"
          value={String(statusCounts['MAINTENANCE'] || 0)}
          subtitle="out of service"
        />
      </div>

      {/* Map placeholder */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-sm font-medium text-muted-foreground">Live Fleet Map</h3>
          <span className="text-xs text-muted-foreground">{gpsConnected} vehicles broadcasting</span>
        </div>
        <div className="relative flex h-80 items-center justify-center bg-slate-100">
          {/* Map placeholder with positioned dots */}
          <div className="absolute inset-4">
            {vehicles
              .filter((v) => v.current_lat !== null && v.current_lon !== null)
              .map((v) => {
                // Normalize to fit placeholder area (Lagos region approx 6.4-6.6 lat, 3.3-3.45 lon)
                const normLat = ((v.current_lat! - 6.4) / 0.22) * 100;
                const normLon = ((v.current_lon! - 3.33) / 0.12) * 100;
                return (
                  <div
                    key={v.id}
                    className="group absolute"
                    style={{ bottom: `${Math.max(5, Math.min(90, normLat))}%`, left: `${Math.max(5, Math.min(90, normLon))}%` }}
                  >
                    <div className={`h-3 w-3 rounded-full border-2 border-white shadow ${
                      v.status === 'EN_ROUTE' ? 'bg-blue-500' : v.status === 'LOADING' ? 'bg-yellow-500' : v.status === 'OFFLOADING' ? 'bg-purple-500' : 'bg-green-500'
                    }`} />
                    <div className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                      {v.registration_number} - {v.driver_name}
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="z-10 flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="h-8 w-8" />
            <span className="text-sm">Interactive map - integrate with MapLibre / Leaflet</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 border-t px-6 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> En Route</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Active/Idle</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Loading</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Offloading</span>
        </div>
      </div>

      {/* Vehicle table */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">All Vehicles</h3>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="ml-3">Loading fleet data...</span>
          </div>
        ) : (
          <DataTable data={vehicles} columns={columns} pageSize={10} />
        )}
      </div>
    </div>
  );
}
