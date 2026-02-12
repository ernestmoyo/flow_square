import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface VehiclePosition {
  id: string;
  registration: string;
  lat: number;
  lon: number;
  status: string;
  driver: string | null;
}

interface FleetTrackerProps {
  vehicles?: VehiclePosition[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function FleetTracker({
  vehicles = [],
  center = [-6.8, 39.28],
  zoom = 11,
  height = '500px',
}: FleetTrackerProps) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: '100%' }} className="rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vehicles.map((vehicle) => (
        <Marker key={vehicle.id} position={[vehicle.lat, vehicle.lon]}>
          <Popup>
            <strong>{vehicle.registration}</strong>
            <br />
            Status: {vehicle.status}
            {vehicle.driver && (
              <>
                <br />
                Driver: {vehicle.driver}
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
