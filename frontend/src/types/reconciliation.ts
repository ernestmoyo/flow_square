export interface VarianceRecord {
  id: string;
  reconciliation_run_id: string;
  node: string;
  expected_volume_m3: number;
  actual_volume_m3: number;
  variance_m3: number;
  variance_pct: number;
  is_exception: boolean;
  asset_id: string | null;
  reference_id: string | null;
  notes: string | null;
  fraud_checks: Record<string, unknown> | null;
  created_at: string;
}

export interface ReconciliationRun {
  id: string;
  name: string;
  status: string;
  run_type: string;
  period_start: string;
  period_end: string;
  asset_id: string | null;
  total_expected_m3: number | null;
  total_actual_m3: number | null;
  total_variance_pct: number | null;
  tolerance_threshold_pct: number;
  summary: string | null;
  completed_at: string | null;
  created_at: string;
  variance_records: VarianceRecord[];
}
