import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FileCheck2, AlertTriangle, CheckCircle2, XCircle, Scale } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import KPICard from '../../components/common/KPICard';
import DataTable from '../../components/tables/DataTable';
import { formatVolume, formatDateTime, formatPercentage } from '../../utils/formatters';

interface EPodRow {
  id: string;
  trip_id: string;
  ticket_number: string;
  vehicle_reg: string;
  driver_name: string;
  destination: string;
  product: string;
  gantry_volume_litres: number;
  delivered_volume_litres: number;
  variance_litres: number;
  variance_pct: number;
  receiver_name: string;
  delivery_time: string;
  verification_status: 'VERIFIED' | 'PENDING' | 'FLAGGED' | 'REJECTED';
  notes: string | null;
}

const VERIFICATION_COLORS: Record<string, string> = {
  VERIFIED: 'bg-green-100 text-green-800',
  PENDING: 'bg-blue-100 text-blue-800',
  FLAGGED: 'bg-yellow-100 text-yellow-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const DEMO_EPODS: EPodRow[] = [
  {
    id: 'ep-001', trip_id: 'tr-002', ticket_number: 'TK-20260212-002',
    vehicle_reg: 'AB-876-DEF', driver_name: 'Chidi Nwosu',
    destination: 'Ore Station', product: 'AGO',
    gantry_volume_litres: 45020, delivered_volume_litres: 44850,
    variance_litres: -170, variance_pct: -0.38,
    receiver_name: 'M. Adeyemi', delivery_time: '2026-02-12T09:30:00Z',
    verification_status: 'VERIFIED', notes: null,
  },
  {
    id: 'ep-002', trip_id: 'tr-006', ticket_number: 'TK-20260212-006',
    vehicle_reg: 'LA-555-PQR', driver_name: 'Ibrahim Sule',
    destination: 'Abeokuta Station', product: 'AGO',
    gantry_volume_litres: 40015, delivered_volume_litres: 39700,
    variance_litres: -315, variance_pct: -0.79,
    receiver_name: 'O. Balogun', delivery_time: '2026-02-12T06:45:00Z',
    verification_status: 'VERIFIED', notes: null,
  },
  {
    id: 'ep-003', trip_id: 'tr-005', ticket_number: 'TK-20260212-005',
    vehicle_reg: 'RV-333-MNO', driver_name: 'Tunde Bakare',
    destination: 'Sagamu Depot', product: 'PMS',
    gantry_volume_litres: 33040, delivered_volume_litres: 32200,
    variance_litres: -840, variance_pct: -2.54,
    receiver_name: 'K. Ojo', delivery_time: '2026-02-12T07:30:00Z',
    verification_status: 'FLAGGED', notes: 'Variance exceeds 1.5% threshold. Pending investigation.',
  },
  {
    id: 'ep-004', trip_id: 'tr-009', ticket_number: 'TK-20260211-015',
    vehicle_reg: 'PH-444-ABC', driver_name: 'Aminu Garba',
    destination: 'Akure Depot', product: 'PMS',
    gantry_volume_litres: 33025, delivered_volume_litres: 32900,
    variance_litres: -125, variance_pct: -0.38,
    receiver_name: 'S. Akinwale', delivery_time: '2026-02-11T16:00:00Z',
    verification_status: 'VERIFIED', notes: null,
  },
  {
    id: 'ep-005', trip_id: 'tr-010', ticket_number: 'TK-20260211-016',
    vehicle_reg: 'IM-667-DEF', driver_name: 'Kola Afolabi',
    destination: 'Ikorodu Depot', product: 'DPK',
    gantry_volume_litres: 20010, delivered_volume_litres: 19850,
    variance_litres: -160, variance_pct: -0.80,
    receiver_name: 'A. Hassan', delivery_time: '2026-02-11T14:30:00Z',
    verification_status: 'VERIFIED', notes: null,
  },
  {
    id: 'ep-006', trip_id: 'tr-011', ticket_number: 'TK-20260211-017',
    vehicle_reg: 'EN-222-VWX', driver_name: 'Segun Ajayi',
    destination: 'Benin Depot', product: 'AGO',
    gantry_volume_litres: 45030, delivered_volume_litres: 43500,
    variance_litres: -1530, variance_pct: -3.40,
    receiver_name: 'E. Ighodaro', delivery_time: '2026-02-11T18:15:00Z',
    verification_status: 'REJECTED', notes: 'Major shortage. Incident raised INC-20260212-003.',
  },
  {
    id: 'ep-007', trip_id: 'tr-001', ticket_number: 'TK-20260212-001',
    vehicle_reg: 'LG-234-XYZ', driver_name: 'Akin Oladele',
    destination: 'Ibadan Depot', product: 'PMS',
    gantry_volume_litres: 33050, delivered_volume_litres: 0,
    variance_litres: 0, variance_pct: 0,
    receiver_name: '--', delivery_time: '2026-02-12T12:00:00Z',
    verification_status: 'PENDING', notes: 'Trip still en route.',
  },
  {
    id: 'ep-008', trip_id: 'tr-012', ticket_number: 'TK-20260211-018',
    vehicle_reg: 'KD-789-STU', driver_name: 'Yusuf Musa',
    destination: 'Oshogbo Depot', product: 'PMS',
    gantry_volume_litres: 33030, delivered_volume_litres: 32880,
    variance_litres: -150, variance_pct: -0.45,
    receiver_name: 'J. Ogunbiyi', delivery_time: '2026-02-11T20:00:00Z',
    verification_status: 'VERIFIED', notes: null,
  },
];

const VARIANCE_THRESHOLD = 1.5;

export default function EPodVerification() {
  const [epods, setEpods] = useState<EPodRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');

  useEffect(() => {
    const timer = setTimeout(() => {
      setEpods(DEMO_EPODS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    if (verificationFilter === 'ALL') return epods;
    return epods.filter((e) => e.verification_status === verificationFilter);
  }, [epods, verificationFilter]);

  const verified = epods.filter((e) => e.verification_status === 'VERIFIED').length;
  const flagged = epods.filter((e) => e.verification_status === 'FLAGGED').length;
  const rejected = epods.filter((e) => e.verification_status === 'REJECTED').length;
  const pending = epods.filter((e) => e.verification_status === 'PENDING').length;

  const completedEpods = epods.filter(
    (e) => e.verification_status !== 'PENDING' && e.delivered_volume_litres > 0,
  );
  const avgVariance = completedEpods.length > 0
    ? completedEpods.reduce((sum, e) => sum + Math.abs(e.variance_pct), 0) / completedEpods.length
    : 0;

  const totalGantryVolume = completedEpods.reduce((sum, e) => sum + e.gantry_volume_litres, 0);
  const totalDeliveredVolume = completedEpods.reduce((sum, e) => sum + e.delivered_volume_litres, 0);

  const columns: ColumnDef<EPodRow, unknown>[] = [
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
    { accessorKey: 'destination', header: 'Destination' },
    { accessorKey: 'product', header: 'Product' },
    {
      accessorKey: 'gantry_volume_litres',
      header: 'Gantry (L)',
      cell: ({ getValue }) => formatVolume(getValue() as number, 'L'),
    },
    {
      accessorKey: 'delivered_volume_litres',
      header: 'Delivered (L)',
      cell: ({ getValue }) => {
        const val = getValue() as number;
        return val > 0 ? formatVolume(val, 'L') : '--';
      },
    },
    {
      accessorKey: 'variance_litres',
      header: 'Variance (L)',
      cell: ({ row }) => {
        const val = row.original.variance_litres;
        if (row.original.delivered_volume_litres === 0) return '--';
        const isHigh = Math.abs(row.original.variance_pct) > VARIANCE_THRESHOLD;
        return (
          <span className={`font-medium ${isHigh ? 'text-red-600' : val < 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {val > 0 ? '+' : ''}{val.toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: 'variance_pct',
      header: 'Variance %',
      cell: ({ row }) => {
        if (row.original.delivered_volume_litres === 0) return '--';
        const pct = row.original.variance_pct;
        const isHigh = Math.abs(pct) > VARIANCE_THRESHOLD;
        return (
          <span className={`font-medium ${isHigh ? 'text-red-600' : 'text-muted-foreground'}`}>
            {pct > 0 ? '+' : ''}{formatPercentage(pct, 2)}
            {isHigh && <AlertTriangle className="ml-1 inline h-3.5 w-3.5" />}
          </span>
        );
      },
    },
    {
      accessorKey: 'receiver_name',
      header: 'Receiver',
    },
    {
      accessorKey: 'delivery_time',
      header: 'Delivery Time',
      cell: ({ getValue }) => formatDateTime(getValue() as string),
    },
    {
      accessorKey: 'verification_status',
      header: 'Verification',
      cell: ({ getValue }) => (
        <StatusBadge status={getValue() as string} colorMap={VERIFICATION_COLORS} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ePOD Verification</h1>
        <p className="text-sm text-muted-foreground">
          Compare gantry metered volumes vs delivered volumes to detect shortages and discrepancies
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <KPICard
          title="Verified"
          value={String(verified)}
          subtitle="within tolerance"
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        />
        <KPICard
          title="Flagged"
          value={String(flagged)}
          subtitle="under review"
          icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
        />
        <KPICard
          title="Rejected"
          value={String(rejected)}
          subtitle="incident raised"
          icon={<XCircle className="h-5 w-5 text-red-600" />}
        />
        <KPICard
          title="Pending"
          value={String(pending)}
          subtitle="awaiting delivery"
          icon={<FileCheck2 className="h-5 w-5" />}
        />
        <KPICard
          title="Avg Variance"
          value={formatPercentage(avgVariance, 2)}
          subtitle={`threshold: ${VARIANCE_THRESHOLD}%`}
          trend={avgVariance > VARIANCE_THRESHOLD ? 'up' : 'down'}
          trendValue={avgVariance > VARIANCE_THRESHOLD ? 'Above' : 'Below'}
          trendPositive={avgVariance <= VARIANCE_THRESHOLD}
          icon={<Scale className="h-5 w-5" />}
        />
      </div>

      {/* Volume comparison bar */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Gantry vs Delivered Volume Comparison</h3>
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Gantry Metered Total</span>
              <span className="font-medium">{formatVolume(totalGantryVolume, 'L')}</span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-blue-500" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Delivered Total</span>
              <span className="font-medium">{formatVolume(totalDeliveredVolume, 'L')}</span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: totalGantryVolume > 0 ? `${(totalDeliveredVolume / totalGantryVolume) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-muted-foreground">Total Variance</span>
            <span className={`font-bold ${Math.abs(totalGantryVolume - totalDeliveredVolume) > totalGantryVolume * 0.015 ? 'text-red-600' : 'text-amber-600'}`}>
              -{formatVolume(totalGantryVolume - totalDeliveredVolume, 'L')} ({formatPercentage(((totalGantryVolume - totalDeliveredVolume) / totalGantryVolume) * 100, 2)})
            </span>
          </div>
        </div>
      </div>

      {/* Per-trip variance visual */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Variance by Trip</h3>
        <div className="space-y-2">
          {completedEpods.map((ep) => {
            const absPct = Math.abs(ep.variance_pct);
            const isHigh = absPct > VARIANCE_THRESHOLD;
            return (
              <div key={ep.id} className="flex items-center gap-3">
                <span className="w-40 truncate text-sm">{ep.ticket_number}</span>
                <div className="flex-1">
                  <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${isHigh ? 'bg-red-500' : absPct > 0.5 ? 'bg-amber-400' : 'bg-green-400'}`}
                      style={{ width: `${Math.min(absPct * 20, 100)}%` }}
                    />
                  </div>
                </div>
                <span className={`w-16 text-right text-sm font-medium ${isHigh ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {formatPercentage(absPct, 2)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-6 rounded-full bg-green-400" /> &lt;0.5%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-6 rounded-full bg-amber-400" /> 0.5% - {VARIANCE_THRESHOLD}%</span>
          <span className="flex items-center gap-1"><span className="h-2 w-6 rounded-full bg-red-500" /> &gt;{VARIANCE_THRESHOLD}% (threshold)</span>
        </div>
      </div>

      {/* Filter + Table */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        <div className="flex gap-2">
          {['ALL', 'VERIFIED', 'PENDING', 'FLAGGED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setVerificationFilter(status)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                verificationFilter === status
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-3">Loading ePOD records...</span>
        </div>
      ) : (
        <DataTable data={filtered} columns={columns} pageSize={10} />
      )}
    </div>
  );
}
