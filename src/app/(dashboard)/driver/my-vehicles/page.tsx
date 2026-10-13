import Link from "next/link";
import { Plus, Users2, Hash, Truck } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/shared/StatusBadge";
import { VEHICLE_ICON } from "@/data/constants/vehicleTypes";
export const dynamic = "force-dynamic";
export default async function MyVehicles() {
  const s = await getServerSession(authOptions);
  const vehicles = await prisma.vehicle.findMany({ where: { ownerId: s!.user.id }, orderBy: { plate: "asc" } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">My Vehicles</h1><p className="text-sm text-slate-500">Manage your vehicles and their details.</p></div>
        <Link href="/driver/my-vehicles/register" className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"><Plus className="h-4 w-4" />Add Vehicle</Link></div>
      {!vehicles.length && <div className="card grid place-items-center gap-2 py-16 text-slate-400"><Truck className="h-10 w-10" /><p className="text-sm">No vehicles yet. Register one to start accepting loads.</p></div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{vehicles.map((v) => { const I = VEHICLE_ICON[v.type] ?? Truck; return (
        <div key={v.id} className="card p-5">
          <div className="flex items-start justify-between"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><I className="h-7 w-7" /></span><StatusBadge value={v.status} /></div>
          <h3 className="mt-4 font-semibold">{v.type.charAt(0) + v.type.slice(1).toLowerCase()}</h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Hash className="h-4 w-4" />{v.plate}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><Users2 className="h-4 w-4" />{v.capacity ?? "—"}</p>
        </div>); })}</div>
    </div>
  );
}
