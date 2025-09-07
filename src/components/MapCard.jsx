import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix default marker icons for Vite
const DefaultIcon = new L.Icon({
  iconUrl, iconRetinaUrl, shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points?.length) return;
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
  }, [points, map]);
  return null;
}

export default function MapCard({ center = { lat: 28.0, lng: 2.6 }, points = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: 180, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div className="font-semibold">{p.title || "Établissement"}</div>
              <div className="text-xs text-slate-500">{p.wilaya} • {p.commune}</div>
            </Popup>
          </Marker>
        ))}
        {points.length > 0 && <FitBounds points={points} />}
      </MapContainer>
    </div>
  );
}
