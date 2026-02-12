export interface Tag {
  id: string;
  name: string;
  unit: string;
  low_limit: number | null;
  high_limit: number | null;
  calibration_date: string | null;
  quality_flag: 'GOOD' | 'BAD' | 'UNCERTAIN';
  description: string | null;
  system_id: string;
  created_at: string;
}

export interface System {
  id: string;
  name: string;
  system_type: string;
  description: string | null;
  asset_id: string;
  tags: Tag[];
  created_at: string;
}

export interface Asset {
  id: string;
  name: string;
  asset_type: string;
  description: string | null;
  location_lat: number | null;
  location_lon: number | null;
  capacity_m3: number | null;
  systems: System[];
  created_at: string;
  updated_at: string;
}
