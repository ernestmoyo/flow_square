import { useState } from 'react';
import { TrendingUp, ShieldCheck, Clock, DollarSign, Target, BarChart3 } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import DemurrageCostChart from '../../components/charts/DemurrageCostChart';
import UFGTrendChart from '../../components/charts/UFGTrendChart';
import FraudScoreGauge from '../../components/charts/FraudScoreGauge';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';

// ---------------------------------------------------------------------------
// Demo / placeholder data
// ---------------------------------------------------------------------------

interface ScorecardItem {
  metric: string;
  target: string;
  actual: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND';
}

const kpiScorecard: ScorecardItem[] = [
  { metric: 'UFG (%)', target: '< 1.5%', actual: '1.15%', status: 'ON_TRACK' },
  { metric: 'Custody Transfer Accuracy', target: '> 99.5%', actual: '99.54%', status: 'ON_TRACK' },
  { metric: 'Incident Response SLA', target: '> 90%', actual: '87.5%', status: 'AT_RISK' },
  { metric: 'CP Compliance', target: '> 95%', actual: '90.5%', status: 'BEHIND' },
  { metric: 'Demurrage Cost Reduction', target: '< $500K/mo', actual: '$420K', status: 'ON_TRACK' },
  { metric: 'System Uptime', target: '> 99.9%', actual: '99.94%', status: 'ON_TRACK' },
  { metric: 'Fleet Fraud Score', target: '< 15', actual: '11', status: 'ON_TRACK' },
  { metric: 'Regulatory Reports On-Time', target: '100%', actual: '100%', status: 'ON_TRACK' },
];

const SCORECARD_STATUS: Record<ScorecardItem['status'], { label: string; color: string }> = {
  ON_TRACK: { label: 'On Track', color: 'bg-green-100 text-green-800' },
  AT_RISK: { label: 'At Risk', color: 'bg-yellow-100 text-yellow-800' },
  BEHIND: { label: 'Behind', color: 'bg-red-100 text-red-800' },
};

const lossesAvoidedData = Array.from({ length: 12 }, (_, i) => ({
  time: `2025-${String(i + 1).padStart(2, '0')}-01T00:00:00Z`,
  value: 180000 + Math.random() * 120000,
}));

const uptimeData = Array.from({ length: 30 }, (_, i) => ({
  time: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
  value: 99.8 + Math.random() * 0.19,
}));

const demurrageData = [
  { vessel: 'MT Bonny River', cost_usd: 85000 },
  { vessel: 'MT Escravos', cost_usd: 124000 },
  { vessel: 'MT Forcados', cost_usd: 42000 },
  { vessel: 'MT Agbami', cost_usd: 67000 },
  { vessel: 'MT Bonga', cost_usd: 102000 },
];

const ufgTrendData = [
  { date: 'Sep', ufg_pct: 1.42 },
  { date: 'Oct', ufg_pct: 1.35 },
  { date: 'Nov', ufg_pct: 1.28 },
  { date: 'Dec', ufg_pct: 1.18 },
  { date: 'Jan', ufg_pct: 1.22 },
  { date: 'Feb', ufg_pct: 1.15 },
];

// ROI Calculator initial values
const DEFAULT_ROI = {
  annual_throughput_m3: 18_000_000,
  product_price_per_m3: 75,
  ufg_reduction_pct: 0.3,
  demurrage_savings_usd: 600_000,
  fraud_losses_avoided_usd: 450_000,
  platform_cost_usd: 1_200_000,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Executive() {
  const [roi, setRoi] = useState(DEFAULT_ROI);

  const ufgSavings = roi.annual_throughput_m3 * roi.product_price_per_m3 * (roi.ufg_reduction_pct / 100);
  const totalBenefit = ufgSavings + roi.demurrage_savings_usd + roi.fraud_losses_avoided_usd;
  const netBenefit = totalBenefit - roi.platform_cost_usd;
  const roiPct = (netBenefit / roi.platform_cost_usd) * 100;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Enterprise KPI scorecard, loss prevention metrics &amp; ROI analysis
        </p>
      </div>

      {/* Top-level KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Losses Avoided (YTD)"
          value={formatCurrency(1_840_000)}
          trend="up"
          trendValue="+22%"
          trendPositive
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <KPICard
          title="System Uptime"
          value={formatPercentage(99.94)}
          subtitle="Last 30 days"
          trend="up"
          trendValue="+0.02%"
          trendPositive
          icon={<Clock className="h-5 w-5" />}
        />
        <KPICard
          title="Demurrage (MTD)"
          value={formatCurrency(420_000)}
          subtitle="5 vessels"
          trend="down"
          trendValue="-18%"
          trendPositive
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          title="UFG (Current)"
          value={formatPercentage(1.15)}
          subtitle="Within target"
          trend="down"
          trendValue="-0.07%"
          trendPositive
          icon={<Target className="h-5 w-5" />}
        />
        <KPICard
          title="Platform ROI"
          value={formatPercentage(roiPct, 0)}
          subtitle="Annualised"
          trend="up"
          trendValue="+15%"
          trendPositive
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* KPI Scorecard */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">KPI Scorecard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4">Metric</th>
                <th className="pb-2 pr-4 text-right">Target</th>
                <th className="pb-2 pr-4 text-right">Actual</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {kpiScorecard.map((item) => (
                <tr key={item.metric} className="border-b last:border-0">
                  <td className="py-2.5 pr-4 font-medium">{item.metric}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-muted-foreground">{item.target}</td>
                  <td className="py-2.5 pr-4 text-right font-mono font-semibold">{item.actual}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SCORECARD_STATUS[item.status].color}`}>
                      {SCORECARD_STATUS[item.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <TimeSeriesChart
            data={lossesAvoidedData}
            title="Monthly Losses Avoided (USD)"
            unit="USD"
            color="#22c55e"
            height={260}
          />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <TimeSeriesChart
            data={uptimeData}
            title="Daily System Uptime (%)"
            unit="%"
            color="#3b82f6"
            height={260}
          />
        </div>
      </div>

      {/* Demurrage & UFG */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 lg:col-span-2">
          <DemurrageCostChart data={demurrageData} height={280} />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <UFGTrendChart data={ufgTrendData} threshold={1.5} height={280} />
        </div>
      </div>

      {/* Fraud Gauges */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Risk Score Summary</h3>
        <div className="flex flex-wrap items-center justify-around gap-6">
          <FraudScoreGauge score={11} label="Fleet Fraud Score" />
          <FraudScoreGauge score={12} label="Leak Probability" />
          <FraudScoreGauge score={38} label="Meter Drift Risk" />
          <FraudScoreGauge score={6} label="Custody Variance Risk" />
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-1 text-lg font-semibold">ROI Calculator</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Estimate the annualised return on investment for the FlowSquare platform
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Annual Throughput (m&sup3;)
              </label>
              <input
                type="number"
                value={roi.annual_throughput_m3}
                onChange={(e) => setRoi({ ...roi, annual_throughput_m3: Number(e.target.value) })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Product Price (USD/m&sup3;)
              </label>
              <input
                type="number"
                value={roi.product_price_per_m3}
                onChange={(e) => setRoi({ ...roi, product_price_per_m3: Number(e.target.value) })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                UFG Reduction (% points)
              </label>
              <input
                type="number"
                step="0.01"
                value={roi.ufg_reduction_pct}
                onChange={(e) => setRoi({ ...roi, ufg_reduction_pct: Number(e.target.value) })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Demurrage Savings (USD/yr)
              </label>
              <input
                type="number"
                value={roi.demurrage_savings_usd}
                onChange={(e) => setRoi({ ...roi, demurrage_savings_usd: Number(e.target.value) })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Fraud Losses Avoided (USD/yr)
              </label>
              <input
                type="number"
                value={roi.fraud_losses_avoided_usd}
                onChange={(e) => setRoi({ ...roi, fraud_losses_avoided_usd: Number(e.target.value) })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Platform Cost (USD/yr)
              </label>
              <input
                type="number"
                value={roi.platform_cost_usd}
                onChange={(e) => setRoi({ ...roi, platform_cost_usd: Number(e.target.value) })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col justify-center space-y-4 rounded-lg bg-muted/50 p-6">
            <h4 className="text-sm font-medium text-muted-foreground">Annual Benefit Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">UFG Reduction Savings</span>
                <span className="font-mono font-semibold text-green-600">
                  {formatCurrency(ufgSavings)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Demurrage Savings</span>
                <span className="font-mono font-semibold text-green-600">
                  {formatCurrency(roi.demurrage_savings_usd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Fraud Losses Avoided</span>
                <span className="font-mono font-semibold text-green-600">
                  {formatCurrency(roi.fraud_losses_avoided_usd)}
                </span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total Benefit</span>
                <span className="font-mono text-green-600">{formatCurrency(totalBenefit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Platform Cost</span>
                <span className="font-mono font-semibold text-red-600">
                  ({formatCurrency(roi.platform_cost_usd)})
                </span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>Net Benefit</span>
                <span className={`font-mono ${netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netBenefit)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>ROI</span>
                <span className={`font-mono ${roiPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(roiPct, 0)}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              * Payback period: {roi.platform_cost_usd > 0 ? formatNumber(12 / (totalBenefit / roi.platform_cost_usd), 1) : '0'} months
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
