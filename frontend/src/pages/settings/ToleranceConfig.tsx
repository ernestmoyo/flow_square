import { useState } from 'react';
import { Save } from 'lucide-react';

interface ToleranceSetting {
  id: string;
  node: string;
  asset: string;
  current_pct: number;
  target_pct: number;
}

const INITIAL_SETTINGS: ToleranceSetting[] = [
  { id: '1', node: 'Vessel Discharge', asset: 'TIPER Terminal', current_pct: 1.5, target_pct: 0.5 },
  { id: '2', node: 'Tank Receipt', asset: 'TIPER Terminal', current_pct: 1.5, target_pct: 0.5 },
  { id: '3', node: 'Gantry Loading', asset: 'TIPER Terminal', current_pct: 1.5, target_pct: 0.5 },
  { id: '4', node: 'Delivery (ePOD)', asset: 'All Fleet', current_pct: 1.5, target_pct: 0.5 },
  { id: '5', node: 'Vessel Discharge', asset: 'Puma Kurasini', current_pct: 1.5, target_pct: 0.5 },
  { id: '6', node: 'Tank Receipt', asset: 'Puma Kurasini', current_pct: 2.0, target_pct: 1.0 },
];

export default function ToleranceConfig() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  const updateTolerance = (id: string, value: number) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, current_pct: value } : s))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tolerance Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Configure variance tolerance thresholds per reconciliation node and asset.
            Pilot: ±1.5% — Target (6-9 months): ±0.5%
          </p>
        </div>
        <button className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Node</th>
                <th className="px-4 py-3 text-left font-medium">Asset</th>
                <th className="px-4 py-3 text-center font-medium">Current Threshold (%)</th>
                <th className="px-4 py-3 text-center font-medium">Target (%)</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="px-4 py-3">{s.node}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.asset}</td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={s.current_pct}
                      onChange={(e) => updateTolerance(s.id, parseFloat(e.target.value) || 0)}
                      step={0.1}
                      min={0}
                      max={10}
                      className="w-20 rounded border bg-background px-2 py-1 text-center text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">±{s.target_pct}%</td>
                  <td className="px-4 py-3 text-center">
                    {s.current_pct <= s.target_pct ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">At Target</span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">Pilot Phase</span>
                    )}
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
