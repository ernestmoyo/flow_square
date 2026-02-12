import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapAsset {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
}

interface MapGeofence {
  id: string;
  name: string;
  center_lat: number;
  center_lon: number;
  radius_meters: number;
}

interface AssetMapProps {
  assets?: MapAsset[];
  geofences?: MapGeofence[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function AssetMap({
  assets = [],
  geofences = [],
  center = [-6.8, 39.28],
  zoom = 12,
  height = '500px',
}: AssetMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: '100%' }} className="rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {assets.map((asset) => (
        <Marker key={asset.id} position={[asset.lat, asset.lon]}>
          <Popup>
            <strong>{asset.name}</strong>
            <br />
            Type: {asset.type}
          </Popup>
        </Marker>
      ))}
      {geofences.map((zone) => (
        <Circle
          key={zone.id}
          center={[zone.center_lat, zone.center_lon]}
          radius={zone.radius_meters}
          pathOptions={{ color: '#3b82f6', fillOpacity: 0.1 }}
        >
          <Popup>{zone.name}</Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}
