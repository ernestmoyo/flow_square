import { create } from 'zustand';

interface TelemetryReading {
  tagId: string;
  time: string;
  value: number;
  quality: string;
}

interface TelemetryState {
  liveReadings: Map<string, TelemetryReading>;
  updateReading: (reading: TelemetryReading) => void;
  clearReadings: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  liveReadings: new Map(),
  updateReading: (reading) =>
    set((state) => {
      const newReadings = new Map(state.liveReadings);
      newReadings.set(reading.tagId, reading);
      return { liveReadings: newReadings };
    }),
  clearReadings: () => set({ liveReadings: new Map() }),
}));
