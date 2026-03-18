'use client';
import { MapContainer, TileLayer, LayersControl, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Map({ lat, lon }: { lat: number, lon: number }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <MapContainer center={[lat, lon]} zoom={10} style={{ height: '500px', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard">
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              attribution="&copy; OpenStreetMap contributors" 
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topographic">
            <TileLayer 
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" 
              attribution="Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)" 
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer 
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community" 
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <Marker position={[lat, lon]}>
          <Popup>
            Selected Location
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
