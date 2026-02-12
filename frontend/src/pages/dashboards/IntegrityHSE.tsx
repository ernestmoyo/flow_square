import { Shield, AlertCircle, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import IncidentTable from '../../components/tables/IncidentTable';
import TimeSeriesChart from '../../components/charts/TimeSeriesChart';
import { formatPercentage } from '../../utils/formatters';
import type { Incident } from '../../types/auth';

// ---------------------------------------------------------------------------
// Demo / placeholder data
// ---------------------------------------------------------------------------

const cpComplianceStats = {
  total_cp_stations: 42,
  compliant: 38,
  non_compliant: 3,
  pending_survey: 1,
  compliance_pct: 90.5,
  last_survey: '2026-02-08',
};

const cpTrendData = Array.from({ length: 12 }, (_, i) => ({
  time: `2026-${String(i + 1).padStart(2, '0')}-01T00:00:00Z`,
  value: 85 + Math.random() * 10,
}));

const demoIncidents: Incident[] = [
  {
    id: 'INC-0012',
    title: 'Corrosion detected on riser section R-04',
    incident_type: 'CORROSION',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    description: 'External corrosion found during inspection.',
    asset_id: 'asset-riser-04',
    location_lat: 4.78,
    location_lon: 7.01,
    assigned_to_id: 'user-003',
    detected_at: '2026-02-10T14:22:00Z',
    sla_deadline: '2026-02-14T14:22:00Z',
    closed_at: null,
    created_at: '2026-02-10T14:25:00Z',
  },
  {
    id: 'INC-0011',
    title: 'CP reading below threshold at SP-17',
    incident_type: 'CP_FAILURE',
    severity: 'MEDIUM',
    status: 'ASSIGNED',
    description: 'Cathodic protection potential dropped below -850 mV.',
    asset_id: 'asset-sp-17',
    location_lat: 4.81,
    location_lon: 7.05,
    assigned_to_id: 'user-005',
    detected_at: '2026-02-09T09:30:00Z',
    sla_deadline: '2026-02-13T09:30:00Z',
    closed_at: null,
    created_at: '2026-02-09T09:35:00Z',
  },
  {
    id: 'INC-0010',
    title: 'Small hydrocarbon spill at loading bay 2',
    incident_type: 'SPILL',
    severity: 'HIGH',
    status: 'EVIDENCE_REQUIRED',
    description: 'Approx 0.5 bbl crude spill during hose connection.',
    asset_id: 'asset-lb-02',
    location_lat: 4.76,
    location_lon: 6.99,
    assigned_to_id: 'user-002',
    detected_at: '2026-02-08T16:45:00Z',
    sla_deadline: '2026-02-11T16:45:00Z',
    closed_at: null,
    created_at: '2026-02-08T16:50:00Z',
  },
  {
    id: 'INC-0009',
    title: 'Gas detector alarm at compressor station',
    incident_type: 'GAS_LEAK',
    severity: 'CRITICAL',
    status: 'DETECTED',
    description: 'H2S alarm triggered; area evacuated.',
    asset_id: 'asset-comp-01',
    location_lat: 4.82,
    location_lon: 7.03,
    assigned_to_id: null,
    detected_at: '2026-02-12T06:18:00Z',
    sla_deadline: '2026-02-12T10:18:00Z',
    closed_at: null,
    created_at: '2026-02-12T06:20:00Z',
  },
  {
    id: 'INC-0007',
    title: 'Safety valve failed pressure test on V-301',
    incident_type: 'EQUIPMENT_FAILURE',
    severity: 'MEDIUM',
    status: 'CLOSED',
    description: 'PSV failed hydro-test; replaced and re-certified.',
    asset_id: 'asset-v-301',
    location_lat: 4.79,
    location_lon: 7.02,
    assigned_to_id: 'user-004',
    detected_at: '2026-02-05T10:00:00Z',
    sla_deadline: '2026-02-10T10:00:00Z',
    closed_at: '2026-02-07T15:30:00Z',
    created_at: '2026-02-05T10:05:00Z',
  },
];

interface CAPAItem {
  id: string;
  title: string;
  type: 'CORRECTIVE' | 'PREVENTIVE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'VERIFIED' | 'CLOSED';
  owner: string;
  due_date: string;
  incident_ref: string;
}

const capaItems: CAPAItem[] = [
  {
    id: 'CAPA-021',
    title: 'Install additional CP anodes on riser R-04',
    type: 'CORRECTIVE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    owner: 'J. Adebayo',
    due_date: '2026-02-20',
    incident_ref: 'INC-0012',
  },
  {
    id: 'CAPA-020',
    title: 'Revise hose connection SOP for loading bay operations',
    type: 'PREVENTIVE',
    priority: 'MEDIUM',
    status: 'OPEN',
    owner: 'A. Okonkwo',
    due_date: '2026-02-25',
    incident_ref: 'INC-0010',
  },
  {
    id: 'CAPA-019',
    title: 'Quarterly H2S detector calibration across all stations',
    type: 'PREVENTIVE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    owner: 'F. Bello',
    due_date: '2026-02-15',
    incident_ref: 'INC-0009',
  },
  {
    id: 'CAPA-017',
    title: 'Replace aging PSVs on vessels V-301 through V-305',
    type: 'CORRECTIVE',
    priority: 'MEDIUM',
    status: 'VERIFIED',
    owner: 'T. Ibrahim',
    due_date: '2026-02-28',
    incident_ref: 'INC-0007',
  },
  {
    id: 'CAPA-015',
    title: 'Implement drone-based pipeline patrol programme',
    type: 'PREVENTIVE',
    priority: 'LOW',
    status: 'OPEN',
    owner: 'D. Uche',
    due_date: '2026-03-15',
    incident_ref: 'INC-0012',
  },
];

const CAPA_STATUS_COLORS: Record<CAPAItem['status'], string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  VERIFIED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const CAPA_TYPE_COLORS: Record<CAPAItem['type'], string> = {
  CORRECTIVE: 'bg-orange-100 text-orange-800',
  PREVENTIVE: 'bg-purple-100 text-purple-800',
};

const PRIORITY_COLORS: Record<CAPAItem['priority'], string> = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-blue-100 text-blue-800',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function IntegrityHSE() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Integrity &amp; HSE</h1>
        <p className="text-sm text-muted-foreground">
          Cathodic protection compliance, incident tracking &amp; CAPA management
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="CP Compliance"
          value={formatPercentage(cpComplianceStats.compliance_pct)}
          subtitle={`${cpComplianceStats.compliant} / ${cpComplianceStats.total_cp_stations} stations`}
          trend="up"
          trendValue="+2.5%"
          trendPositive
          icon={<Shield className="h-5 w-5" />}
        />
        <KPICard
          title="Open Incidents"
          value="4"
          subtitle="1 critical"
          trend="up"
          trendValue="+1"
          trendPositive={false}
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <KPICard
          title="Open CAPAs"
          value="3"
          subtitle="2 high priority"
          trend="flat"
          trendValue="stable"
          icon={<ClipboardCheck className="h-5 w-5" />}
        />
        <KPICard
          title="SLA On-Time"
          value={formatPercentage(87.5)}
          subtitle="Last 30 days"
          trend="down"
          trendValue="-4.2%"
          trendPositive={false}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* CP Compliance Detail + Trend */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* CP Station Summary */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">CP Station Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total stations</span>
              <span className="font-semibold">{cpComplianceStats.total_cp_stations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Compliant
              </span>
              <span className="font-semibold text-green-600">{cpComplianceStats.compliant}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Non-compliant
              </span>
              <span className="font-semibold text-red-600">{cpComplianceStats.non_compliant}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                Pending survey
              </span>
              <span className="font-semibold text-yellow-600">{cpComplianceStats.pending_survey}</span>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last survey</span>
              <span className="text-sm">{cpComplianceStats.last_survey}</span>
            </div>
          </div>
        </div>

        {/* CP Compliance Trend */}
        <div className="rounded-lg border bg-card p-4 lg:col-span-2">
          <TimeSeriesChart
            data={cpTrendData}
            title="CP Compliance Trend (%)"
            unit="%"
            color="#22c55e"
            height={260}
          />
        </div>
      </div>

      {/* Open Incidents */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Open Incidents</h3>
        <IncidentTable data={demoIncidents} />
      </div>

      {/* CAPA Tracking */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">CAPA Tracking</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Priority</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Owner</th>
                <th className="pb-2 pr-4">Due Date</th>
                <th className="pb-2">Incident</th>
              </tr>
            </thead>
            <tbody>
              {capaItems.map((capa) => (
                <tr key={capa.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-4 font-mono text-xs">{capa.id}</td>
                  <td className="py-2.5 pr-4 max-w-xs truncate">{capa.title}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CAPA_TYPE_COLORS[capa.type]}`}>
                      {capa.type}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[capa.priority]}`}>
                      {capa.priority}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CAPA_STATUS_COLORS[capa.status]}`}>
                      {capa.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">{capa.owner}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{capa.due_date}</td>
                  <td className="py-2.5 font-mono text-xs text-muted-foreground">{capa.incident_ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
