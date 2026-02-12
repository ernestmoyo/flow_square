import StatusBadge from '../../components/common/StatusBadge';

const DEMO_LOGS = [
  { id: '1', action: 'CREATE', resource_type: 'Incident', resource_id: 'INC-042', user: 'System', ip: '10.0.1.50', time: '2025-01-15 14:32:10', details: 'Auto-created from leak alarm threshold breach' },
  { id: '2', action: 'UPDATE', resource_type: 'Tank', resource_id: 'TK-101', user: 'ops@tiper.co.tz', ip: '10.0.1.12', time: '2025-01-15 14:15:00', details: 'Level updated from 8500 to 8200 m³' },
  { id: '3', action: 'CREATE', resource_type: 'ReconciliationRun', resource_id: 'REC-044', user: 'System', ip: '10.0.1.50', time: '2025-01-15 02:00:00', details: 'Daily auto-reconciliation triggered' },
  { id: '4', action: 'UPDATE', resource_type: 'Incident', resource_id: 'INC-041', user: 'hse@tiper.co.tz', ip: '10.0.1.15', time: '2025-01-15 11:45:00', details: 'Status changed: IN_PROGRESS → EVIDENCE_REQUIRED' },
  { id: '5', action: 'CREATE', resource_type: 'CustodyTransfer', resource_id: 'CTB-1290', user: 'finance@tiper.co.tz', ip: '10.0.1.20', time: '2025-01-15 10:30:00', details: 'Vessel discharge custody transfer recorded' },
  { id: '6', action: 'CREATE', resource_type: 'ComplianceReport', resource_id: 'RPT-005', user: 'admin@flowsquare.io', ip: '10.0.1.1', time: '2025-01-15 09:00:00', details: 'Audit pack H2 2024 generated' },
  { id: '7', action: 'UPDATE', resource_type: 'Tag', resource_id: 'PS3.FLOW', user: 'System', ip: '10.0.1.50', time: '2025-01-15 08:05:00', details: 'Quality flag changed: GOOD → UNCERTAIN (noisy sensor)' },
  { id: '8', action: 'DELETE', resource_type: 'User', resource_id: 'usr-old', user: 'admin@flowsquare.io', ip: '10.0.1.1', time: '2025-01-14 16:00:00', details: 'Soft-deleted inactive user account' },
];

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
};

export default function AuditTrail() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Trail</h1>
      <p className="text-sm text-muted-foreground">Complete audit log — who, what, when, from which IP</p>

      <div className="flex gap-3">
        <input type="text" placeholder="Filter by resource type..." className="rounded-md border bg-background px-3 py-2 text-sm" />
        <input type="text" placeholder="Filter by user..." className="rounded-md border bg-background px-3 py-2 text-sm" />
        <input type="date" className="rounded-md border bg-background px-3 py-2 text-sm" />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Time</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
                <th className="px-4 py-3 text-left font-medium">Resource</th>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">IP</th>
                <th className="px-4 py-3 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_LOGS.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{log.time}</td>
                  <td className="px-4 py-3"><StatusBadge status={log.action} colorMap={ACTION_COLORS} /></td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{log.resource_type}</span>
                    <br />
                    <span className="font-mono text-xs">{log.resource_id}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{log.user}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.ip}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs text-muted-foreground">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
