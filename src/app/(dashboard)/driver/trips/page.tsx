import Link from "next/link";
import ShareLocation from "@/components/driver/ShareLocation";
import ScheduledTrips from "@/components/driver/Trips/ScheduledTrips";
import { Plus, Play, CheckCircle2, MapPin, ArrowRight, Route, AlertCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/shared/StatusBadge";
import ShipmentTimeline from "@/components/shared/ShipmentTimeline";
import { startTrip, completeTrip } from "@/actions/trips/update-trip-status.action";
export const dynamic = "force-dynamic";
export default async function Trips({ searchParams }: { searchParams: { error?: string } }) {
  const s = await getServerSession(authOptions);
  const loads = await prisma.load.findMany({ where: { driverId: s!.user.id }, orderBy: [{ status: "asc" }, { createdAt: "desc" }] });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">My Trips</h1><p className="text-sm text-slate-500">View and manage your assigned trips.</p></div><Link href="/driver/trips/create" className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"><Plus className="h-4 w-4" />Schedule Trip</Link></div>
      {searchParams.error && <p className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{searchParams.error}</p>}
      <ShareLocation />
      {!loads.length && <div className="card grid place-items-center gap-2 py-16 text-slate-400"><Route className="h-10 w-10" /><p className="text-sm">Accept a load to start your first trip.</p></div>}
      {loads.map((l) => (
        <div key={l.id} className="card space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-semibold">{l.item}</p><p className="flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5" />{l.origin}<ArrowRight className="h-3 w-3" />{l.destination}</p></div>
            <div className="flex items-center gap-3"><span className="font-bold text-brand-600">ETB {l.price.toLocaleString()}</span><StatusBadge value={l.status} />
              {l.status === "RESERVED" && <form action={startTrip.bind(null, l.id)}><button className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white hover:bg-brand-700"><Play className="h-3.5 w-3.5" />Start Trip</button></form>}
              {l.status === "IN_TRANSIT" && <form action={completeTrip.bind(null, l.id)}><button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Mark Delivered</button></form>}</div></div>
          <ShipmentTimeline status={l.status} />
        </div>))}
      <ScheduledTrips driverId={s!.user.id} />
    </div>
  );
}
