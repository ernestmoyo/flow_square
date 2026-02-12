import { useMemo, useState } from 'react';
import { Database, Droplets, AlertTriangle } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatVolume, formatPercentage } from '../../utils/formatters';

interface Tank {
  id: string;
  name: string;
  product: string;
  capacity_m3: number;
  current_volume_m3: number;
  temperature_c: number;
  last_gauging: string;
  status: 'IN_SERVICE' | 'FILLING' | 'DISCHARGING' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
}

const TANK_STATUS_COLORS: Record<string, string> = {
  IN_SERVICE: 'bg-green-100 text-green-800',
  FILLING: 'bg-blue-100 text-blue-800',
  DISCHARGING: 'bg-purple-100 text-purple-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  OUT_OF_SERVICE: 'bg-gray-100 text-gray-800',
};

const PRODUCT_COLORS: Record<string, string> = {
  'Bonny Light Crude': 'bg-amber-500',
  'Forcados Blend': 'bg-orange-500',
  PMS: 'bg-green-500',
  AGO: 'bg-blue-500',
  DPK: 'bg-purple-500',
  'Slop Oil': 'bg-gray-500',
};

const DEMO_TANKS: Tank[] = [
  { id: 't-001', name: 'TK-101', product: 'Bonny Light Crude', capacity_m3: 50000, current_volume_m3: 42500, temperature_c: 32.4, last_gauging: '2026-02-12T06:00:00Z', status: 'IN_SERVICE' },
  { id: 't-002', name: 'TK-102', product: 'Bonny Light Crude', capacity_m3: 50000, current_volume_m3: 18200, temperature_c: 31.8, last_gauging: '2026-02-12T06:00:00Z', status: 'DISCHARGING' },
  { id: 't-003', name: 'TK-201', product: 'Forcados Blend', capacity_m3: 45000, current_volume_m3: 38700, temperature_c: 33.1, last_gauging: '2026-02-12T06:00:00Z', status: 'FILLING' },
  { id: 't-004', name: 'TK-202', product: 'Forcados Blend', capacity_m3: 45000, current_volume_m3: 5400, temperature_c: 30.2, last_gauging: '2026-02-12T06:00:00Z', status: 'IN_SERVICE' },
  { id: 't-005', name: 'TK-301', product: 'PMS', capacity_m3: 30000, current_volume_m3: 22500, temperature_c: 28.5, last_gauging: '2026-02-12T06:00:00Z', status: 'IN_SERVICE' },
  { id: 't-006', name: 'TK-302', product: 'PMS', capacity_m3: 30000, current_volume_m3: 27800, temperature_c: 28.9, last_gauging: '2026-02-12T06:00:00Z', status: 'DISCHARGING' },
  { id: 't-007', name: 'TK-401', product: 'AGO', capacity_m3: 25000, current_volume_m3: 15600, temperature_c: 27.3, last_gauging: '2026-02-12T06:00:00Z', status: 'IN_SERVICE' },
  { id: 't-008', name: 'TK-402', product: 'AGO', capacity_m3: 25000, current_volume_m3: 23100, temperature_c: 27.8, last_gauging: '2026-02-12T06:00:00Z', status: 'FILLING' },
  { id: 't-009', name: 'TK-501', product: 'DPK', capacity_m3: 20000, current_volume_m3: 8200, temperature_c: 26.5, last_gauging: '2026-02-12T06:00:00Z', status: 'IN_SERVICE' },
  { id: 't-010', name: 'TK-601', product: 'Slop Oil', capacity_m3: 10000, current_volume_m3: 3400, temperature_c: 30.0, last_gauging: '2026-02-12T06:00:00Z', status: 'MAINTENANCE' },
];

function fillPercentage(tank: Tank): number {
  return (tank.current_volume_m3 / tank.capacity_m3) * 100;
}

function fillLevelColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 75) return 'bg-amber-500';
  if (pct >= 30) return 'bg-emerald-500';
  if (pct >= 10) return 'bg-blue-500';
  return 'bg-gray-400';
}

export default function TankInventory() {
  const [productFilter, setProductFilter] = useState<string>('ALL');

  const filteredTanks = useMemo(() => {
    if (productFilter === 'ALL') return DEMO_TANKS;
    return DEMO_TANKS.filter((t) => t.product === productFilter);
  }, [productFilter]);

  const products = [...new Set(DEMO_TANKS.map((t) => t.product))];

  const totalCapacity = DEMO_TANKS.reduce((sum, t) => sum + t.capacity_m3, 0);
  const totalVolume = DEMO_TANKS.reduce((sum, t) => sum + t.current_volume_m3, 0);
  const highFillTanks = DEMO_TANKS.filter((t) => fillPercentage(t) >= 90).length;
  const lowFillTanks = DEMO_TANKS.filter((t) => fillPercentage(t) <= 15).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tank Inventory</h1>
        <p className="text-sm text-muted-foreground">Real-time tank levels, products, and operational status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total Inventory"
          value={formatVolume(totalVolume)}
          subtitle={`of ${formatVolume(totalCapacity)} capacity`}
          icon={<Database className="h-5 w-5" />}
        />
        <KPICard
          title="Utilization"
          value={formatPercentage((totalVolume / totalCapacity) * 100)}
          subtitle="overall fill level"
          icon={<Droplets className="h-5 w-5" />}
        />
        <KPICard
          title="High Fill (>90%)"
          value={String(highFillTanks)}
          subtitle={highFillTanks > 0 ? 'attention required' : 'none'}
          icon={highFillTanks > 0 ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : undefined}
        />
        <KPICard
          title="Low Fill (<15%)"
          value={String(lowFillTanks)}
          subtitle={lowFillTanks > 0 ? 'may need replenishment' : 'none'}
        />
      </div>

      {/* Product filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter by product:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setProductFilter('ALL')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              productFilter === 'ALL'
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {products.map((p) => (
            <button
              key={p}
              onClick={() => setProductFilter(p)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                productFilter === p
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tank cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTanks.map((tank) => {
          const pct = fillPercentage(tank);
          return (
            <div key={tank.id} className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold">{tank.name}</h4>
                <StatusBadge status={tank.status} colorMap={TANK_STATUS_COLORS} />
              </div>

              {/* Product badge */}
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${PRODUCT_COLORS[tank.product] || 'bg-gray-400'}`} />
                <span className="text-sm text-muted-foreground">{tank.product}</span>
              </div>

              {/* Visual fill indicator */}
              <div className="mt-4">
                <div className="flex items-end justify-between text-xs text-muted-foreground">
                  <span>{formatVolume(tank.current_volume_m3)}</span>
                  <span>{formatPercentage(pct, 0)}</span>
                </div>
                <div className="mt-1 h-5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${fillLevelColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-xs text-muted-foreground">
                  of {formatVolume(tank.capacity_m3)}
                </div>
              </div>

              {/* Details */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Temp</span>
                  <p className="font-medium">{tank.temperature_c.toFixed(1)} &deg;C</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ullage</span>
                  <p className="font-medium">{formatVolume(tank.capacity_m3 - tank.current_volume_m3)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary table by product */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Inventory Summary by Product</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-right font-medium">Tanks</th>
                <th className="px-4 py-3 text-right font-medium">Total Capacity</th>
                <th className="px-4 py-3 text-right font-medium">Current Volume</th>
                <th className="px-4 py-3 text-right font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const productTanks = DEMO_TANKS.filter((t) => t.product === product);
                const cap = productTanks.reduce((s, t) => s + t.capacity_m3, 0);
                const vol = productTanks.reduce((s, t) => s + t.current_volume_m3, 0);
                const util = (vol / cap) * 100;
                return (
                  <tr key={product} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${PRODUCT_COLORS[product] || 'bg-gray-400'}`} />
                        {product}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{productTanks.length}</td>
                    <td className="px-4 py-3 text-right">{formatVolume(cap)}</td>
                    <td className="px-4 py-3 text-right">{formatVolume(vol)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${util >= 90 ? 'text-red-600' : util <= 15 ? 'text-amber-600' : 'text-green-600'}`}>
                      {formatPercentage(util)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
