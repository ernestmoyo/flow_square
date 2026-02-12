import { DollarSign, FileCheck, Scale, AlertTriangle } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import { formatCurrency, formatVolume, formatPercentage } from '../../utils/formatters';

// ---------------------------------------------------------------------------
// Demo / placeholder data
// ---------------------------------------------------------------------------

interface CustodyTransferRow {
  id: string;
  batch_id: string;
  from_entity: string;
  to_entity: string;
  product: string;
  bl_volume_m3: number;
  metered_volume_m3: number;
  variance_m3: number;
  variance_pct: number;
  status: 'MATCHED' | 'WITHIN_TOLERANCE' | 'EXCEPTION';
  transfer_time: string;
}

const custodyTransfers: CustodyTransferRow[] = [
  {
    id: 'CT-1001',
    batch_id: 'BL-2026-0218',
    from_entity: 'NNPC JV',
    to_entity: 'Shell Western',
    product: 'Bonny Light',
    bl_volume_m3: 150000,
    metered_volume_m3: 149820,
    variance_m3: -180,
    variance_pct: -0.12,
    status: 'MATCHED',
    transfer_time: '2026-02-11T18:00:00Z',
  },
  {
    id: 'CT-1002',
    batch_id: 'BL-2026-0219',
    from_entity: 'TotalEnergies',
    to_entity: 'Dangote Refinery',
    product: 'Forcados Crude',
    bl_volume_m3: 120000,
    metered_volume_m3: 119340,
    variance_m3: -660,
    variance_pct: -0.55,
    status: 'WITHIN_TOLERANCE',
    transfer_time: '2026-02-11T22:30:00Z',
  },
  {
    id: 'CT-1003',
    batch_id: 'BL-2026-0220',
    from_entity: 'Chevron Nigeria',
    to_entity: 'NLNG',
    product: 'Condensate',
    bl_volume_m3: 80000,
    metered_volume_m3: 78640,
    variance_m3: -1360,
    variance_pct: -1.7,
    status: 'EXCEPTION',
    transfer_time: '2026-02-12T04:15:00Z',
  },
  {
    id: 'CT-1004',
    batch_id: 'BL-2026-0221',
    from_entity: 'ExxonMobil',
    to_entity: 'Indorama Eleme',
    product: 'Qua Iboe Light',
    bl_volume_m3: 95000,
    metered_volume_m3: 94870,
    variance_m3: -130,
    variance_pct: -0.14,
    status: 'MATCHED',
    transfer_time: '2026-02-12T08:00:00Z',
  },
  {
    id: 'CT-1005',
    batch_id: 'BL-2026-0222',
    from_entity: 'Seplat Energy',
    to_entity: 'NNPC Trading',
    product: 'Escravos Blend',
    bl_volume_m3: 60000,
    metered_volume_m3: 59520,
    variance_m3: -480,
    variance_pct: -0.8,
    status: 'WITHIN_TOLERANCE',
    transfer_time: '2026-02-12T10:45:00Z',
  },
];

const CT_STATUS_COLORS: Record<CustodyTransferRow['status'], string> = {
  MATCHED: 'bg-green-100 text-green-800',
  WITHIN_TOLERANCE: 'bg-yellow-100 text-yellow-800',
  EXCEPTION: 'bg-red-100 text-red-800',
};

interface RoyaltySummary {
  entity: string;
  product: string;
  period: string;
  gross_volume_m3: number;
  royalty_rate_pct: number;
  royalty_volume_m3: number;
  royalty_value_usd: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
}

const royaltySummaries: RoyaltySummary[] = [
  {
    entity: 'NNPC/Shell JV',
    product: 'Bonny Light',
    period: 'Jan 2026',
    gross_volume_m3: 450000,
    royalty_rate_pct: 20,
    royalty_volume_m3: 90000,
    royalty_value_usd: 6_750_000,
    status: 'APPROVED',
  },
  {
    entity: 'Chevron Nigeria',
    product: 'Escravos Blend',
    period: 'Jan 2026',
    gross_volume_m3: 310000,
    royalty_rate_pct: 18.5,
    royalty_volume_m3: 57350,
    royalty_value_usd: 4_014_500,
    status: 'SUBMITTED',
  },
  {
    entity: 'TotalEnergies',
    product: 'Forcados Crude',
    period: 'Jan 2026',
    gross_volume_m3: 280000,
    royalty_rate_pct: 20,
    royalty_volume_m3: 56000,
    royalty_value_usd: 4_200_000,
    status: 'SUBMITTED',
  },
  {
    entity: 'ExxonMobil',
    product: 'Qua Iboe Light',
    period: 'Jan 2026',
    gross_volume_m3: 370000,
    royalty_rate_pct: 18.5,
    royalty_volume_m3: 68450,
    royalty_value_usd: 5_133_750,
    status: 'DRAFT',
  },
];

const ROYALTY_STATUS_COLORS: Record<RoyaltySummary['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
};

interface DisputeItem {
  id: string;
  batch_ref: string;
  counterparty: string;
  dispute_volume_m3: number;
  dispute_value_usd: number;
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'ESCALATED' | 'RESOLVED';
  raised_date: string;
}

const disputes: DisputeItem[] = [
  {
    id: 'DSP-003',
    batch_ref: 'BL-2026-0220',
    counterparty: 'NLNG',
    dispute_volume_m3: 1360,
    dispute_value_usd: 102_000,
    reason: 'Metered volume 1.7% below B/L; exceeds 0.5% tolerance',
    status: 'OPEN',
    raised_date: '2026-02-12',
  },
  {
    id: 'DSP-002',
    batch_ref: 'BL-2026-0198',
    counterparty: 'Dangote Refinery',
    dispute_volume_m3: 890,
    dispute_value_usd: 66_750,
    reason: 'Temperature correction discrepancy on custody meter',
    status: 'UNDER_REVIEW',
    raised_date: '2026-02-05',
  },
  {
    id: 'DSP-001',
    batch_ref: 'BL-2026-0182',
    counterparty: 'Shell Western',
    dispute_volume_m3: 420,
    dispute_value_usd: 31_500,
    reason: 'Prover factor outdated at time of transfer',
    status: 'RESOLVED',
    raised_date: '2026-01-28',
  },
];

const DISPUTE_STATUS_COLORS: Record<DisputeItem['status'], string> = {
  OPEN: 'bg-red-100 text-red-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  ESCALATED: 'bg-orange-100 text-orange-800',
  RESOLVED: 'bg-green-100 text-green-800',
};

const varianceTrendData = Array.from({ length: 30 }, (_, i) => ({
  time: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
  value: -0.3 + Math.random() * 0.8 - 0.2,
}));

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FinanceReg() {
  const totalRoyaltyValue = royaltySummaries.reduce((sum, r) => sum + r.royalty_value_usd, 0);
  const totalDisputeValue = disputes
    .filter((d) => d.status !== 'RESOLVED')
    .reduce((sum, d) => sum + d.dispute_value_usd, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Finance &amp; Regulatory</h1>
        <p className="text-sm text-muted-foreground">
          Custody transfer truth table, royalty accounting &amp; dispute management
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Transfers Today"
          value="5"
          subtitle="4 matched, 1 exception"
          trend="flat"
          trendValue="stable"
          icon={<Scale className="h-5 w-5" />}
        />
        <KPICard
          title="Total Royalty (Jan)"
          value={formatCurrency(totalRoyaltyValue)}
          subtitle="4 entities"
          trend="up"
          trendValue="+8.3%"
          trendPositive
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          title="Open Disputes"
          value="2"
          subtitle={formatCurrency(totalDisputeValue) + ' at risk'}
          trend="up"
          trendValue="+1"
          trendPositive={false}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <KPICard
          title="Avg Variance"
          value={formatPercentage(0.46)}
          subtitle="Below 0.5% tolerance"
          trend="down"
          trendValue="-0.12%"
          trendPositive
          icon={<FileCheck className="h-5 w-5" />}
        />
      </div>

      {/* Custody Transfer Truth Table */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Custody Transfer Truth Table
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3">Batch</th>
                <th className="pb-2 pr-3">From</th>
                <th className="pb-2 pr-3">To</th>
                <th className="pb-2 pr-3">Product</th>
                <th className="pb-2 pr-3 text-right">B/L Vol (m&sup3;)</th>
                <th className="pb-2 pr-3 text-right">Metered (m&sup3;)</th>
                <th className="pb-2 pr-3 text-right">Variance</th>
                <th className="pb-2 pr-3 text-right">Var %</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {custodyTransfers.map((ct) => (
                <tr key={ct.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-3 font-mono text-xs">{ct.batch_id}</td>
                  <td className="py-2.5 pr-3">{ct.from_entity}</td>
                  <td className="py-2.5 pr-3">{ct.to_entity}</td>
                  <td className="py-2.5 pr-3">{ct.product}</td>
                  <td className="py-2.5 pr-3 text-right font-mono">{formatVolume(ct.bl_volume_m3)}</td>
                  <td className="py-2.5 pr-3 text-right font-mono">{formatVolume(ct.metered_volume_m3)}</td>
                  <td className={`py-2.5 pr-3 text-right font-mono ${ct.variance_m3 < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {ct.variance_m3 > 0 ? '+' : ''}{formatVolume(Math.abs(ct.variance_m3))}
                  </td>
                  <td className={`py-2.5 pr-3 text-right font-mono ${Math.abs(ct.variance_pct) > 0.5 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                    {ct.variance_pct > 0 ? '+' : ''}{formatPercentage(ct.variance_pct, 2)}
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CT_STATUS_COLORS[ct.status]}`}>
                      {ct.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variance Trend Chart */}
      <div className="rounded-lg border bg-card p-4">
        <TimeSeriesChart
          data={varianceTrendData}
          title="Daily Custody Transfer Variance (%)"
          unit="%"
          color="#f59e0b"
          height={240}
        />
      </div>

      {/* Royalty Summary */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Royalty Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3">Entity</th>
                <th className="pb-2 pr-3">Product</th>
                <th className="pb-2 pr-3">Period</th>
                <th className="pb-2 pr-3 text-right">Gross Vol (m&sup3;)</th>
                <th className="pb-2 pr-3 text-right">Rate</th>
                <th className="pb-2 pr-3 text-right">Royalty Vol (m&sup3;)</th>
                <th className="pb-2 pr-3 text-right">Value (USD)</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {royaltySummaries.map((r, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-2.5 pr-3 font-medium">{r.entity}</td>
                  <td className="py-2.5 pr-3">{r.product}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{r.period}</td>
                  <td className="py-2.5 pr-3 text-right font-mono">{formatVolume(r.gross_volume_m3)}</td>
                  <td className="py-2.5 pr-3 text-right font-mono">{formatPercentage(r.royalty_rate_pct)}</td>
                  <td className="py-2.5 pr-3 text-right font-mono">{formatVolume(r.royalty_volume_m3)}</td>
                  <td className="py-2.5 pr-3 text-right font-mono font-semibold">{formatCurrency(r.royalty_value_usd)}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROYALTY_STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-semibold">
                <td className="pt-3 pr-3" colSpan={6}>Total</td>
                <td className="pt-3 pr-3 text-right font-mono">{formatCurrency(totalRoyaltyValue)}</td>
                <td className="pt-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Dispute Pack */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Dispute Pack</h3>
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            {disputes.filter((d) => d.status !== 'RESOLVED').length} active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3">ID</th>
                <th className="pb-2 pr-3">Batch Ref</th>
                <th className="pb-2 pr-3">Counterparty</th>
                <th className="pb-2 pr-3 text-right">Volume (m&sup3;)</th>
                <th className="pb-2 pr-3 text-right">Value (USD)</th>
                <th className="pb-2 pr-3">Reason</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2">Raised</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-3 font-mono text-xs">{d.id}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs">{d.batch_ref}</td>
                  <td className="py-2.5 pr-3 font-medium">{d.counterparty}</td>
                  <td className="py-2.5 pr-3 text-right font-mono text-red-600">
                    {formatVolume(d.dispute_volume_m3)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono font-semibold">
                    {formatCurrency(d.dispute_value_usd)}
                  </td>
                  <td className="py-2.5 pr-3 max-w-xs truncate text-muted-foreground">{d.reason}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DISPUTE_STATUS_COLORS[d.status]}`}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{d.raised_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
