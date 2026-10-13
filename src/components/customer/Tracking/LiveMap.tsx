"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap } from "react-leaflet";
const pin = (c: string, ring = false) => L.divIcon({ className: "", iconSize: [26, 26], iconAnchor: [13, 13],
  html: `<div style="width:26px;height:26px;border-radius:50%;background:${c};border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)${ring ? ";outline:6px solid rgba(74,46,232,.25)" : ""}"></div>` });
function Fit({ pts }: { pts: [number, number][] }) {
  const map = useMap(); const k = JSON.stringify(pts.length > 1 ? [pts[0], pts[pts.length - 1]] : pts);
  useEffect(() => { if (pts.length) map.fitBounds(pts, { padding: [40, 40] }); }, [map, k]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
export default function LiveMap({ coords, from, to, driver }: { coords: [number, number][]; from: string; to: string; driver: { lat: number; lng: number } | null }) {
  return (
    <MapContainer center={coords[0]} zoom={7} scrollWheelZoom className="h-[420px] w-full rounded-2xl">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={coords} pathOptions={{ color: "#4a2ee8", weight: 5, opacity: 0.75 }} />
      <Marker position={coords[0]} icon={pin("#10b981")}><Tooltip>{from}</Tooltip></Marker>
      <Marker position={coords[coords.length - 1]} icon={pin("#f43f5e")}><Tooltip>{to}</Tooltip></Marker>
      {driver && <Marker position={[driver.lat, driver.lng]} icon={pin("#4a2ee8", true)} zIndexOffset={1000}><Tooltip permanent>Driver</Tooltip></Marker>}
      <Fit pts={coords} />
    </MapContainer>
  );
}
