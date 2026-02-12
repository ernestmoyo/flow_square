export interface TelemetryReading {
  tag_id: string;
  time: string;
  value: number;
  quality: 'GOOD' | 'BAD' | 'UNCERTAIN';
  raw_value: number | null;
  source: string | null;
}

export interface TelemetryQuery {
  tagIds: string[];
  start: string;
  end: string;
  downsample?: string;
}
