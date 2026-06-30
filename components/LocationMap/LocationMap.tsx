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
  physical_location: {
    id: string;
    address: string;
    address2?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
}

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function pinSvg(fill: string) {
  return `<svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 12 24 12 24S24 18.63 24 12C24 5.37 18.63 0 12 0z" fill="${fill}"/><circle cx="12" cy="11" r="4" fill="white"/></svg>`
}

const normalIcon = L.divIcon({
  className: '',
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -38],
  html: pinSvg('#2563EB'),
})

const highlightIcon = L.divIcon({
  className: '',
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -44],
  html: `<svg width="28" height="42" viewBox="0 0 28 42" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.27 0 0 6.27 0 14c0 7.73 14 28 14 28S28 21.73 28 14C28 6.27 21.73 0 14 0z" fill="#E8612A"/><circle cx="14" cy="13" r="5" fill="white"/></svg>`,
})

const FALLBACK_CENTER: [number, number] = [45.523, -122.6765];
const FALLBACK_ZOOM = 13;
const USER_ZOOM = 15;

function GeolocationController() {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;
    let active = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!active) return;
        const { latitude, longitude } = pos.coords;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
        try {
          map.flyTo([latitude, longitude], USER_ZOOM, { animate: true, duration: 1.5 });
        } catch {
          // no-op: map may not be ready yet
        }
      },
      (err) => {
        console.warn("Geolocation unavailable:", err.message);
      },
      { timeout: 8000, maximumAge: 60_000 }
    );

    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

interface ResourceMapProps<T extends Location> {
  onSelect: (a: T) => void;
  data: T[];
  selectedId?: string | null;
}

function hasCoordinates<T extends Location>(item: T): item is T & { physical_location: { latitude: number; longitude: number } } {
  return Number.isFinite(item.physical_location.latitude) && Number.isFinite(item.physical_location.longitude);
}

function ResourceMap<T extends Location>({ onSelect, data, selectedId }: ResourceMapProps<T>) {
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
                <Marker
                  key={item.physical_location.id}
                  position={[item.physical_location.latitude, item.physical_location.longitude]}
                  icon={selectedId === item.id ? highlightIcon : normalIcon}
                  eventHandlers={{
                    click: () => {
                      onSelect(item);
                    }
                  }}
                >
                  <Popup>
                    <p>{item.physical_location.address}</p>
                    {item.physical_location.address2 && <p>{item.physical_location.address2}</p>}
                  </Popup>
                </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    )
}

export default ResourceMap;
