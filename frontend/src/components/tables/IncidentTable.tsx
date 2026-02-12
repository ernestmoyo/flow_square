import { ColumnDef } from '@tanstack/react-table';
import type { Incident } from '../../types/auth';
import DataTable from './DataTable';
import StatusBadge from '../common/StatusBadge';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';
import { INCIDENT_SEVERITIES, INCIDENT_STATUSES } from '../../utils/constants';

const columns: ColumnDef<Incident, unknown>[] = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'incident_type', header: 'Type', cell: ({ getValue }) => (getValue() as string).replace(/_/g, ' ') },
  {
    accessorKey: 'severity',
    header: 'Severity',
    cell: ({ getValue }) => {
      const sev = getValue() as keyof typeof INCIDENT_SEVERITIES;
      return <StatusBadge status={sev} colorMap={Object.fromEntries(Object.entries(INCIDENT_SEVERITIES).map(([k, v]) => [k, v.color]))} />;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const st = getValue() as keyof typeof INCIDENT_STATUSES;
      return <StatusBadge status={st} colorMap={Object.fromEntries(Object.entries(INCIDENT_STATUSES).map(([k, v]) => [k, v.color]))} />;
    },
  },
  { accessorKey: 'detected_at', header: 'Detected', cell: ({ getValue }) => formatDateTime(getValue() as string) },
  {
    accessorKey: 'sla_deadline',
    header: 'SLA',
    cell: ({ getValue }) => {
      const val = getValue() as string | null;
      return val ? formatRelativeTime(val) : '-';
    },
  },
];

interface IncidentTableProps {
  data: Incident[];
}

export default function IncidentTable({ data }: IncidentTableProps) {
  return <DataTable data={data} columns={columns} />;
}
