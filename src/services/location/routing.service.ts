import { coordsOf } from "@/data/constants/cities";
export type Route = { coords: [number, number][]; distanceKm: number; durationMin: number; source: "openrouteservice" | "estimate" };
type P = { lat: number; lng: number };
export const haversineKm = (a: P, b: P) => { const r = (d: number) => (d * Math.PI) / 180, h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
const cache = new Map<string, Route>();

export async function getRoute(from: string, to: string): Promise<Route | null> {
  const a = coordsOf(from), b = coordsOf(to);
  if (!a || !b) return null; // city not in our coordinate table
  const key = `${from}|${to}`.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;
  let route: Route | null = null;
  if (process.env.ORS_API_KEY) {
    try {
      const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", { method: "POST", headers: { Authorization: process.env.ORS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: [[a.lng, a.lat], [b.lng, b.lat]] }), next: { revalidate: 86400 } });
      if (res.ok) { const f = (await res.json()).features[0]; route = { coords: f.geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]), distanceKm: f.properties.summary.distance / 1000, durationMin: f.properties.summary.duration / 60, source: "openrouteservice" }; }
    } catch { /* fall back to the estimate */ }
  }
  if (!route) { const km = haversineKm(a, b) * 1.3; route = { coords: [[a.lat, a.lng], [b.lat, b.lng]], distanceKm: km, durationMin: (km / 50) * 60, source: "estimate" }; } // ~30% road factor, 50 km/h average
  cache.set(key, route);
  return route;
}
