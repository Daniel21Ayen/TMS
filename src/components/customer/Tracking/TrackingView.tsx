"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Route as RouteIcon, Timer, Radio, MapPinOff, Loader2, CheckCircle2, Info } from "lucide-react";
const LiveMap = dynamic(() => import("./LiveMap"), { ssr: false, loading: () => <div className="grid h-[420px] place-items-center rounded-2xl bg-slate-100"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div> });
type D = { title: string; from: string; to: string; status: string; live: boolean; finished: boolean; route: { coords: [number, number][]; distanceKm: number; durationMin: number; source: string } | null; driver: { lat: number; lng: number; updatedAt: string } | null };
const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)} min`);
export default function TrackingView({ id }: { id: string }) {
  const [d, setD] = useState<D | null>(null), [err, setErr] = useState("");
  useEffect(() => {
    let stop = false;
    const load = async () => { try { const r = await fetch(`/api/tracking/${id}`, { cache: "no-store" }); if (!r.ok) throw 0; const j: D = await r.json(); if (!stop) { setD(j); setErr(""); } } catch { if (!stop) setErr("Tracking isn't available for this item."); } };
    load(); const t = setInterval(() => { if (!d?.finished) load(); }, 10000);
    return () => { stop = true; clearInterval(t); };
  }, [id, d?.finished]);
  if (err) return <p className="card grid place-items-center gap-2 py-16 text-sm text-slate-400"><MapPinOff className="h-8 w-8" />{err}</p>;
  if (!d) return <p className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-brand-600" /></p>;
  const ago = d.driver ? Math.max(0, Math.round((Date.now() - new Date(d.driver.updatedAt).getTime()) / 1000)) : 0;
  const stat = (I: typeof Timer, l: string, v: string) => <div className="card flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><I className="h-5 w-5" /></span><div><p className="text-xs text-slate-400">{l}</p><p className="font-semibold">{v}</p></div></div>;
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">{d.title}</h1><p className="text-sm text-slate-500">{d.from} → {d.to}</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stat(RouteIcon, "Distance", d.route ? `${Math.round(d.route.distanceKm)} km` : "—")}{stat(Timer, "Estimated travel time", d.route ? dur(d.route.durationMin) : "—")}
        {stat(d.finished ? CheckCircle2 : Radio, "Status", d.finished ? "Completed" : d.live ? (d.driver ? `Live · updated ${ago}s ago` : "In transit · no live location") : "Not started yet")}</div>
      {d.route ? <LiveMap coords={d.route.coords} from={d.from} to={d.to} driver={d.driver} /> : <p className="card grid place-items-center gap-2 py-16 text-sm text-slate-400"><MapPinOff className="h-8 w-8" />Map preview isn&apos;t available for these locations yet.</p>}
      {d.route?.source === "estimate" && <p className="flex items-center gap-2 text-xs text-slate-400"><Info className="h-3.5 w-3.5" />Distance and time are estimates (straight-line + 30%). Add an OpenRouteService key for real road routes.</p>}
    </div>
  );
}
