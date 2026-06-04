import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-markercluster";
import 'leaflet/dist/leaflet.css';
import type { ResourceItemType } from "../schema";

interface ResourceMapProps {
  onSelect: (a: ResourceItemType) => void;
  data: ResourceItemType[];
}

const ResourceMap = ({ onSelect, data }: ResourceMapProps) => {

    return (
        <div style={{height: '50vh', width: '50vw', minWidth: '50vw'}}>
        <MapContainer center={[45.523, -122.6765]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup>
          {data.map(item => {
            return (
              <>
              <Marker position={item.latLon}
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
              </>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
      </div>
    )
    
}

export default ResourceMap;