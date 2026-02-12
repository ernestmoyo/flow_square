interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
}

const DEFAULT_COLORS: Record<string, string> = {
  GOOD: 'bg-green-100 text-green-800',
  BAD: 'bg-red-100 text-red-800',
  UNCERTAIN: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  EXCEPTION: 'bg-red-100 text-red-800',
  AUTO_CLOSED: 'bg-green-100 text-green-800',
};

export default function StatusBadge({ status, colorMap }: StatusBadgeProps) {
  const colors = colorMap || DEFAULT_COLORS;
  const colorClass = colors[status] || 'bg-gray-100 text-gray-800';
  const label = status.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}
