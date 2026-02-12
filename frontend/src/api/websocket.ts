type MessageHandler = (data: unknown) => void;

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || `ws://${window.location.host}`;

export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  connect(channel: string, path: string): void {
    if (this.connections.has(channel)) return;

    const ws = new WebSocket(`${WS_BASE_URL}/api/v1/ws/${path}`);

    ws.onopen = () => {
      console.log(`[WS] Connected: ${channel}`);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const channelHandlers = this.handlers.get(channel);
      if (channelHandlers) {
        channelHandlers.forEach((handler) => handler(data));
      }
    };

    ws.onclose = () => {
      console.log(`[WS] Disconnected: ${channel}`);
      this.connections.delete(channel);
      // Auto-reconnect after 3 seconds
      const timer = setTimeout(() => this.connect(channel, path), 3000);
      this.reconnectTimers.set(channel, timer);
    };

    ws.onerror = (error) => {
      console.error(`[WS] Error on ${channel}:`, error);
    };

    this.connections.set(channel, ws);
  }

  subscribe(channel: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);

    return () => {
      this.handlers.get(channel)?.delete(handler);
    };
  }

  send(channel: string, data: unknown): void {
    const ws = this.connections.get(channel);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  disconnect(channel: string): void {
    const timer = this.reconnectTimers.get(channel);
    if (timer) clearTimeout(timer);
    this.reconnectTimers.delete(channel);

    const ws = this.connections.get(channel);
    if (ws) {
      ws.close();
      this.connections.delete(channel);
    }
    this.handlers.delete(channel);
  }

  disconnectAll(): void {
    for (const channel of this.connections.keys()) {
      this.disconnect(channel);
    }
  }
}

export const wsManager = new WebSocketManager();
