import { Package, MapPin, ArrowRight, Weight, CheckCircle2, Info } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { acceptLoad } from "@/actions/driver/accept-load.action";
import StatusBadge from "@/components/shared/StatusBadge";
export const dynamic = "force-dynamic";
export default async function AvailableLoads() {
  const s = await getServerSession(authOptions);
  const [loads, mine, active] = await Promise.all([
    prisma.load.findMany({ where: { status: "AVAILABLE" }, orderBy: { createdAt: "desc" } }),
    prisma.load.findMany({ where: { driverId: s!.user.id }, orderBy: { createdAt: "desc" } }),
    prisma.vehicle.count({ where: { ownerId: s!.user.id, status: "ACTIVE" } }),
  ]);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Available Loads</h1><p className="text-sm text-slate-500">Find loads near your location.</p></div>
      {!active && <p className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700"><Info className="h-4 w-4" />Register an active vehicle to accept loads.</p>}
      <div className="grid gap-4 lg:grid-cols-2">{loads.map((l) => (
        <div key={l.id} className="card flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Package className="h-6 w-6" /></span>
          <div className="min-w-0 flex-1"><p className="font-semibold">{l.item}</p>
            <p className="flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5" />{l.origin}<ArrowRight className="h-3 w-3" />{l.destination}</p>
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><Weight className="h-3.5 w-3.5" />{l.weightKg.toLocaleString()} kg</p></div>
          <div className="text-right"><p className="font-bold text-brand-600">ETB {l.price.toLocaleString()}</p>
            <form action={acceptLoad.bind(null, l.id)}><button disabled={!active} className="mt-2 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-40">Accept</button></form></div>
        </div>))}</div>
      {!loads.length && <p className="card py-12 text-center text-sm text-slate-400">No loads available right now.</p>}
      {!!mine.length && <div className="card p-5"><h2 className="mb-3 flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-emerald-500" />My Accepted Loads</h2>
        <ul className="divide-y divide-slate-50">{mine.map((l) => <li key={l.id} className="flex items-center justify-between py-3 text-sm"><span>{l.item} · {l.origin} → {l.destination}</span><StatusBadge value={l.status} /></li>)}</ul></div>}
    </div>
  );
}
