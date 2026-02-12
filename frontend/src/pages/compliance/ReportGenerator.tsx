import { useState } from 'react';
import KPICard from '../../components/common/KPICard';
import StatusBadge from '../../components/common/StatusBadge';
import { FileText, Download } from 'lucide-react';

const REPORT_TYPES = [
  { value: 'BPS_QUANTITY', label: 'BPS Quantity File' },
  { value: 'WMA_REPORT', label: 'WMA Report' },
  { value: 'CUSTODY_TRAIL', label: 'Custody Trail' },
  { value: 'MONTHLY_COMPLIANCE', label: 'Monthly Compliance' },
  { value: 'AUDIT_PACK', label: 'Audit Pack' },
];

const RECENT_REPORTS = [
  { id: 'RPT-001', title: 'Monthly Compliance - December 2024', type: 'MONTHLY_COMPLIANCE', status: 'GENERATED', format: 'PDF', date: '01 Jan 2025' },
  { id: 'RPT-002', title: 'BPS Quantity - Q4 2024', type: 'BPS_QUANTITY', status: 'GENERATED', format: 'Excel', date: '05 Jan 2025' },
  { id: 'RPT-003', title: 'Custody Trail - Batch CTB-2024-1287', type: 'CUSTODY_TRAIL', status: 'GENERATED', format: 'PDF', date: '10 Jan 2025' },
  { id: 'RPT-004', title: 'Monthly Compliance - November 2024', type: 'MONTHLY_COMPLIANCE', status: 'GENERATED', format: 'PDF', date: '01 Dec 2024' },
  { id: 'RPT-005', title: 'Audit Pack - H2 2024', type: 'AUDIT_PACK', status: 'DRAFT', format: 'PDF', date: '15 Jan 2025' },
];

export default function ReportGenerator() {
  const [selectedType, setSelectedType] = useState('');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Report Generator</h1>
      <p className="text-sm text-muted-foreground">One-click BPS/WMA reports, custody trails, audit-complete packs</p>

      <div className="grid gap-4 md:grid-cols-3">
        <KPICard title="Reports Generated" value={String(RECENT_REPORTS.length)} subtitle="this month" icon={<FileText className="h-5 w-5" />} />
        <KPICard title="On-Time Rate" value="100%" subtitle="target: 100%" />
        <KPICard title="Pending Reviews" value="1" subtitle="audit pack" />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Generate New Report</h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select report type...</option>
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input type="date" className="rounded-md border bg-background px-3 py-2 text-sm" />
          <input type="date" className="rounded-md border bg-background px-3 py-2 text-sm" />
          <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
            Generate Report
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Format</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_REPORTS.map((report) => (
                <tr key={report.id} className="border-b">
                  <td className="px-4 py-3">{report.title}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{report.type}</td>
                  <td className="px-4 py-3"><StatusBadge status={report.status} colorMap={{ GENERATED: 'bg-green-100 text-green-800', DRAFT: 'bg-yellow-100 text-yellow-800' }} /></td>
                  <td className="px-4 py-3">{report.format}</td>
                  <td className="px-4 py-3 text-muted-foreground">{report.date}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="rounded p-1 hover:bg-accent"><Download className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
