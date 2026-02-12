export interface UFGResult {
  asset_id: string;
  period_start: string;
  period_end: string;
  receipts_m3: number;
  dispatches_m3: number;
  tank_variance_m3: number;
  ufg_m3: number;
  ufg_pct: number;
  node_breakdown: Record<string, unknown>[];
}

export interface LeakResult {
  asset_id: string;
  segment_id: string | null;
  score: number;
  delta_pressure: number | null;
  delta_flow: number | null;
  acoustic_signal: number | null;
  row_patrol_flag: boolean;
  computed_at: string;
}

export interface FraudResult {
  trip_id: string;
  score: number;
  flags: string[];
  short_load_detected: boolean;
  ghost_trip_detected: boolean;
  duplicate_ticket: boolean;
  off_route: boolean;
  computed_at: string;
}
