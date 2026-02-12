import { useCallback } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { useWebSocket } from './useWebSocket';

interface AlertPayload {
  type: string;
  severity: string;
  title?: string;
  message?: string;
  asset_id?: string;
  incident_id?: string;
}

export function useRealtimeAlerts() {
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleAlert = useCallback(
    (data: unknown) => {
      const alert = data as AlertPayload;
      addNotification({
        type: alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'error' : 'warning',
        title: alert.title || `Alert: ${alert.type}`,
        message: alert.message || `${alert.type} alert received`,
        timestamp: new Date().toISOString(),
      });
    },
    [addNotification],
  );

  useWebSocket('alerts', 'alerts', handleAlert);
}
