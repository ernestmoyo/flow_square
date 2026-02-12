import { ColumnDef } from '@tanstack/react-table';
import type { VarianceRecord } from '../../types/reconciliation';
import DataTable from './DataTable';
import StatusBadge from '../common/StatusBadge';
import { formatPercentage, formatVolume } from '../../utils/formatters';

const columns: ColumnDef<VarianceRecord, unknown>[] = [
  { accessorKey: 'node', header: 'Node' },
  {
    accessorKey: 'expected_volume_m3',
    header: 'Expected (m\u00B3)',
    cell: ({ getValue }) => formatVolume(getValue() as number),
  },
  {
    accessorKey: 'actual_volume_m3',
    header: 'Actual (m\u00B3)',
    cell: ({ getValue }) => formatVolume(getValue() as number),
  },
  {
    accessorKey: 'variance_pct',
    header: 'Variance',
    cell: ({ getValue }) => {
      const pct = getValue() as number;
      const color = pct > 1.5 ? 'text-red-600 font-semibold' : 'text-green-600';
      return <span className={color}>{formatPercentage(pct)}</span>;
    },
  },
  {
    accessorKey: 'is_exception',
    header: 'Status',
    cell: ({ getValue }) => (
      <StatusBadge status={(getValue() as boolean) ? 'EXCEPTION' : 'AUTO_CLOSED'} />
    ),
  },
  { accessorKey: 'reference_id', header: 'Reference' },
];

interface ReconciliationTableProps {
  data: VarianceRecord[];
}

export default function ReconciliationTable({ data }: ReconciliationTableProps) {
  return <DataTable data={data} columns={columns} />;
}
