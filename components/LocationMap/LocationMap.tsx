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
import type { Location } from "@/schemas/zodSchema";

delete (L.Icon.Default.prototype as unknown as any)._getIconUrl;
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

interface ResourceMapProps {
  onSelect: (a: Location) => void;
  data: Location[];
}

const ResourceMap = ({ onSelect, data }: ResourceMapProps) => {

    return (
      <div className="h-full w-full min-w-0">
        <MapContainer center={FALLBACK_CENTER} zoom={FALLBACK_ZOOM} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeolocationController />
          <MarkerClusterGroup>
            {data.map(item => (
                <Marker key={item.id} position={[item.latitude, item.longitude]}
                eventHandlers={{
                  click: () => {
                    onSelect(item);
                  }
                }}>
                  <Popup>
                    <h3>{item.name}</h3>
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