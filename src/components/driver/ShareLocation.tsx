"use client";
import { useEffect, useRef, useState } from "react";
import { LocateFixed, Radio, AlertCircle } from "lucide-react";
export default function ShareLocation() {
  const [on, setOn] = useState(false), [msg, setMsg] = useState(""), [bad, setBad] = useState(false), last = useRef(0);
  useEffect(() => {
    if (!on) return;
    if (!navigator.geolocation) { setBad(true); setMsg("Location isn't supported on this device"); setOn(false); return; }
    const id = navigator.geolocation.watchPosition(async (p) => {
      if (Date.now() - last.current < 15000) return; last.current = Date.now(); // send at most every 15 s
      const r = await fetch("/api/tracking/ping", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude }) });
      if (r.ok) { setBad(false); setMsg(`Last sent ${new Date().toLocaleTimeString("en-GB")}`); } else { setBad(true); setMsg((await r.json()).error ?? "Couldn't send location"); if (r.status === 409) setOn(false); }
    }, () => { setBad(true); setMsg("Location permission denied"); setOn(false); }, { enableHighAccuracy: true, maximumAge: 10000 });
    return () => navigator.geolocation.clearWatch(id);
  }, [on]);
  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${on ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>{on ? <Radio className="h-5 w-5 animate-pulse" /> : <LocateFixed className="h-5 w-5" />}</span>
        <div><p className="text-sm font-semibold">Share live location</p><p className={`flex items-center gap-1 text-xs ${bad ? "text-rose-500" : "text-slate-400"}`}>{bad && <AlertCircle className="h-3.5 w-3.5" />}{msg || "Customers can follow your trip while it's in progress. Only shared during active trips."}</p></div></div>
      <button onClick={() => { setMsg(""); setBad(false); setOn(!on); }} className={`rounded-xl px-4 py-2 text-sm font-medium ${on ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-brand-600 text-white hover:bg-brand-700"}`}>{on ? "Stop sharing" : "Start sharing"}</button>
    </div>
  );
}
