export interface Vehicle {
  id: string;
  registration_number: string;
  asset_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  capacity_litres: number | null;
  compartments: number | null;
  current_lat: number | null;
  current_lon: number | null;
  last_gps_time: string | null;
  status: string;
  created_at: string;
}

export interface Trip {
  id: string;
  vehicle_id: string;
  origin_terminal_id: string | null;
  destination_name: string;
  destination_lat: number | null;
  destination_lon: number | null;
  status: string;
  loaded_volume_litres: number | null;
  gantry_metered_litres: number | null;
  departure_time: string | null;
  arrival_time: string | null;
  ticket_number: string | null;
  created_at: string;
}

export interface EPod {
  id: string;
  trip_id: string;
  delivered_volume_litres: number;
  receiver_name: string | null;
  delivery_time: string | null;
  is_verified: boolean;
  notes: string | null;
  created_at: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  zone_type: string;
  center_lat: number;
  center_lon: number;
  radius_meters: number | null;
  polygon: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}
