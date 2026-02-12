import { NavLink } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  FileText,
  Gauge,
  Map,
  Settings,
  Ship,
  Truck,
  Warehouse,
} from 'lucide-react';
import { useState } from 'react';

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: { to: string; label: string }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Dashboards',
    icon: <Gauge className="h-4 w-4" />,
    items: [
      { to: '/dashboard/control-room', label: 'Control Room' },
      { to: '/dashboard/integrity', label: 'Integrity / HSE' },
      { to: '/dashboard/finance', label: 'Finance / Regulatory' },
      { to: '/dashboard/executive', label: 'Executive' },
    ],
  },
  {
    label: 'Vessels',
    icon: <Ship className="h-4 w-4" />,
    items: [
      { to: '/vessels', label: 'Vessel List' },
      { to: '/vessels/berth-scheduler', label: 'Berth Scheduler' },
    ],
  },
  {
    label: 'Terminals',
    icon: <Warehouse className="h-4 w-4" />,
    items: [
      { to: '/terminals/inventory', label: 'Tank Inventory' },
      { to: '/terminals/loading', label: 'Loading Operations' },
    ],
  },
  {
    label: 'Fleet',
    icon: <Truck className="h-4 w-4" />,
    items: [
      { to: '/fleet', label: 'Fleet Overview' },
      { to: '/fleet/trips', label: 'Trip Management' },
      { to: '/fleet/epod', label: 'ePOD Verification' },
    ],
  },
  {
    label: 'Analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    items: [
      { to: '/analytics/ufg', label: 'UFG Analysis' },
      { to: '/analytics/leak', label: 'Leak Detection' },
      { to: '/analytics/fraud', label: 'Fraud Monitoring' },
      { to: '/analytics/maintenance', label: 'Predictive Maintenance' },
    ],
  },
  {
    label: 'Reconciliation',
    icon: <Activity className="h-4 w-4" />,
    items: [{ to: '/reconciliation', label: 'Reconciliation Dashboard' }],
  },
  {
    label: 'Compliance',
    icon: <FileText className="h-4 w-4" />,
    items: [
      { to: '/compliance/reports', label: 'Report Generator' },
      { to: '/compliance/audit', label: 'Audit Trail' },
    ],
  },
  {
    label: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    items: [
      { to: '/settings/assets', label: 'Asset Hierarchy' },
      { to: '/settings/users', label: 'User Management' },
      { to: '/settings/tolerance', label: 'Tolerance Config' },
    ],
  },
];

function NavGroupItem({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <span className="flex items-center gap-2">
          {group.icon}
          {group.label}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="ml-6 space-y-0.5">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-1.5 text-sm ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold text-primary">FlowSquare</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navGroups.map((group) => (
          <NavGroupItem key={group.label} group={group} />
        ))}
      </nav>
    </aside>
  );
}
