export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  phone: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  title: string;
  incident_type: string;
  severity: string;
  status: string;
  description: string | null;
  asset_id: string | null;
  location_lat: number | null;
  location_lon: number | null;
  assigned_to_id: string | null;
  detected_at: string;
  sla_deadline: string | null;
  closed_at: string | null;
  created_at: string;
}

export interface ComplianceReport {
  id: string;
  title: string;
  report_type: string;
  period_start: string;
  period_end: string;
  status: string;
  generated_by_id: string | null;
  file_url: string | null;
  file_format: string | null;
  version: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_id: string | null;
  ip_address: string | null;
  details: string | null;
  created_at: string;
}

export interface CustodyTransfer {
  id: string;
  batch_id: string;
  from_entity: string;
  to_entity: string;
  product_type: string;
  volume_m3: number;
  transfer_time: string;
  created_at: string;
}
