import { useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface GeofenceEditorProps {
  initialCenter?: [number, number];
  initialRadius?: number;
  onSave?: (center: [number, number], radius: number) => void;
  height?: string;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function GeofenceEditor({
  initialCenter = [-6.8, 39.28],
  initialRadius = 500,
  onSave,
  height = '400px',
}: GeofenceEditorProps) {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [radius, setRadius] = useState(initialRadius);

  return (
    <div className="space-y-3">
      <MapContainer center={center} zoom={14} style={{ height, width: '100%' }} className="rounded-lg">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onClick={(lat, lng) => setCenter([lat, lng])} />
        <Marker position={center} />
        <Circle center={center} radius={radius} pathOptions={{ color: '#3b82f6', fillOpacity: 0.15 }} />
      </MapContainer>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          Radius (m):
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-24 rounded border px-2 py-1"
          />
        </label>
        <span className="text-xs text-muted-foreground">
          Center: {center[0].toFixed(4)}, {center[1].toFixed(4)}
        </span>
        {onSave && (
          <button
            onClick={() => onSave(center, radius)}
            className="rounded bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Save Zone
          </button>
        )}
      </div>
    </div>
  );
}
