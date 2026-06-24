"use client";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-markercluster";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import { useEffect } from "react";

export interface Location {
  id: string;
  address: string;
  address2?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const FALLBACK_CENTER: [number, number] = [45.523, -122.6765];
const FALLBACK_ZOOM = 13;
const USER_ZOOM = 15;

function GeolocationController() {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo(
          [pos.coords.latitude, pos.coords.longitude],
          USER_ZOOM,
          { animate: true, duration: 1.5 }
        );
      },
      (err) => {
        console.warn("Geolocation unavailable:", err.message);
      },
      { timeout: 8000, maximumAge: 60_000 }
    );
  }, [map]);

  return null;
}

interface ResourceMapProps<T extends Location> {
  onSelect: (a: T) => void;
  data: T[];
}

function hasCoordinates<T extends Location>(item: T): item is T & { latitude: number; longitude: number } {
  return item.latitude != null && item.longitude != null;
}

function ResourceMap<T extends Location>({ onSelect, data }: ResourceMapProps<T>) {
    return (
      <div className="h-full w-full min-w-0">
        <MapContainer center={FALLBACK_CENTER} zoom={FALLBACK_ZOOM} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeolocationController />
          <MarkerClusterGroup>
            {data.filter(hasCoordinates).map(item => (
                <Marker key={item.id} position={[item.latitude, item.longitude]}
                eventHandlers={{
                  click: () => {
                    onSelect(item);
                  }
                }}>
                  <Popup>
                    <p>{item.address}</p>
                    {item.address2 && <p>{item.address2}</p>}
                  </Popup>
                </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    )
}

export default ResourceMap;
