import { useEffect, useRef } from 'react';
import { wsManager } from '../api/websocket';

export function useWebSocket(channel: string, path: string, onMessage: (data: unknown) => void) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    wsManager.connect(channel, path);
    const unsubscribe = wsManager.subscribe(channel, (data) => handlerRef.current(data));

    return () => {
      unsubscribe();
    };
  }, [channel, path]);
}
