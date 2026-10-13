import Link from "next/link";
import { PackageSearch, Navigation } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ShipmentTimeline from "@/components/shared/ShipmentTimeline";
export const dynamic = "force-dynamic";
export default async function Deliveries() {
  const s = await getServerSession(authOptions);
  const loads = await prisma.load.findMany({ where: { postedById: s!.user.id }, include: { driver: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Track Orders</h1><p className="text-sm text-slate-500">Track your items and deliveries.</p></div>
      {!loads.length && <div className="card grid place-items-center gap-2 py-16 text-slate-400"><PackageSearch className="h-10 w-10" /><p className="text-sm">Nothing to track yet.</p></div>}
      {loads.map((l) => (
        <div key={l.id} className="card space-y-5 p-6">
          <div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">{l.item}</p><p className="text-sm text-slate-500">{l.origin} → {l.destination}</p></div>
            <p className="text-sm text-slate-500">{l.driver ? `Driver: ${l.driver.name}` : "Waiting for a driver"}</p></div>
          <ShipmentTimeline status={l.status} />
          {["RESERVED", "IN_TRANSIT"].includes(l.status) && <Link href={`/customer/tracking/${l.id}`} className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-100"><Navigation className="h-4 w-4" />Track on map</Link>}
        </div>))}
    </div>
  );
}
