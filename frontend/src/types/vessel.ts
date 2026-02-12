export interface Vessel {
  id: string;
  name: string;
  imo_number: string | null;
  dwt: number | null;
  flag: string | null;
  vessel_type: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BerthSchedule {
  id: string;
  vessel_id: string;
  berth_name: string;
  eta: string;
  ata: string | null;
  etd: string | null;
  atd: string | null;
  cargo_type: string | null;
  cargo_volume_m3: number | null;
  bill_of_lading_volume_m3: number | null;
  metered_volume_m3: number | null;
  created_at: string;
}

export interface DemurrageRecord {
  id: string;
  vessel_id: string;
  laytime_hours_allowed: number;
  laytime_hours_used: number;
  demurrage_rate_usd_per_day: number;
  total_demurrage_usd: number;
  created_at: string;
}
