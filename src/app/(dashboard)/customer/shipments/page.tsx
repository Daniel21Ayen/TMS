import Link from "next/link";
import { Plus, MapPin, ArrowRight, Weight, Trash2, Package } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/shared/StatusBadge";
import { cancelShipment } from "@/actions/shipments/create-shipment.action";
export const dynamic = "force-dynamic";
export default async function Shipments() {
  const s = await getServerSession(authOptions);
  const loads = await prisma.load.findMany({ where: { postedById: s!.user.id }, include: { driver: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">My Shipments</h1><p className="text-sm text-slate-500">Post items and manage your shipments.</p></div>
        <Link href="/customer/shipments/create" className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"><Plus className="h-4 w-4" />New Shipment</Link></div>
      {!loads.length && <div className="card grid place-items-center gap-2 py-16 text-slate-400"><Package className="h-10 w-10" /><p className="text-sm">No shipments yet.</p></div>}
      <div className="space-y-3">{loads.map((l) => (
        <div key={l.id} className="card flex flex-wrap items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600"><Package className="h-6 w-6" /></span>
          <div className="min-w-[200px] flex-1"><p className="font-semibold">{l.item}</p>
            <p className="flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5" />{l.origin}<ArrowRight className="h-3 w-3" />{l.destination}</p>
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><Weight className="h-3.5 w-3.5" />{l.weightKg.toLocaleString()} kg{l.driver && <> · Driver: {l.driver.name}</>}</p></div>
          <p className="font-bold text-brand-600">ETB {l.price.toLocaleString()}</p><StatusBadge value={l.status} />
          {l.status === "AVAILABLE" && <form action={cancelShipment.bind(null, l.id)}><button title="Cancel shipment" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></form>}
        </div>))}</div>
    </div>
  );
}
