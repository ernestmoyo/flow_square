import { useCallback, useEffect, useState } from 'react';
import { telemetryApi } from '../api/endpoints';

interface TelemetryReading {
  tag_id: string;
  time: string;
  value: number;
  quality: string;
}

export function useTelemetry(tagIds: string[], start: string, end: string, downsample?: string) {
  const [data, setData] = useState<Record<string, TelemetryReading[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (tagIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await telemetryApi.query({ tagIds, start, end, downsample });
      const results: Record<string, TelemetryReading[]> = {};
      for (const series of response.data.data) {
        results[series.tag_id] = series.readings;
      }
      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch telemetry');
    } finally {
      setLoading(false);
    }
  }, [tagIds, start, end, downsample]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
