import Link from "next/link";
import { Download, Package, PackageCheck, Percent, Gauge, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/shared/StatCard";
import { RevenueBars } from "@/components/admin/Dashboard/Charts";
export const dynamic = "force-dynamic";
export default async function Reports({ searchParams }: { searchParams: { days?: string } }) {
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const since = new Date(); since.setDate(since.getDate() - (days - 1)); since.setHours(0, 0, 0, 0);
  const [posted, delivered, comm, routes, top] = await Promise.all([
    prisma.load.count({ where: { createdAt: { gte: since } } }), prisma.load.count({ where: { createdAt: { gte: since }, status: "DELIVERED" } }),
    prisma.commission.findMany({ where: { createdAt: { gte: since } }, select: { amount: true, createdAt: true } }),
    prisma.load.groupBy({ by: ["origin", "destination"], where: { createdAt: { gte: since } }, _count: true, orderBy: { _count: { origin: "desc" } }, take: 5 }),
    prisma.load.groupBy({ by: ["driverId"], where: { createdAt: { gte: since }, status: "DELIVERED", driverId: { not: null } }, _count: true, _sum: { price: true }, orderBy: { _sum: { price: "desc" } }, take: 5 }),
  ]);
  const names = await prisma.user.findMany({ where: { id: { in: top.map((t) => t.driverId!) } }, select: { id: true, name: true } });
  const revenue = Array.from({ length: days }, (_, i) => { const d = new Date(since); d.setDate(d.getDate() + i);
    return { day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), revenue: comm.filter((c) => c.createdAt.toDateString() === d.toDateString()).reduce((a, c) => a + c.amount, 0) }; });
  const total = comm.reduce((a, c) => a + c.amount, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Reports & Analysis</h1><p className="text-sm text-slate-500">View and export platform reports.</p></div>
        <div className="flex items-center gap-2">{[7, 30, 90].map((d) => <Link key={d} href={`?days=${d}`} className={`rounded-xl px-4 py-2 text-sm font-medium ${d === days ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-brand-50"}`}>{d}d</Link>)}
          <a href={`/api/admin/reports?days=${days}`} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-600 shadow-card hover:bg-brand-50"><Download className="h-4 w-4" />Export CSV</a></div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Shipments Posted" value={String(posted)} icon={Package} /><StatCard label="Delivered" value={String(delivered)} icon={PackageCheck} tone="green" />
        <StatCard label="Commission" value={`ETB ${total.toLocaleString()}`} icon={Percent} tone="orange" /><StatCard label="Delivery Rate" value={posted ? `${Math.round((delivered / posted) * 100)}%` : "—"} icon={Gauge} tone="violet" />
      </div>
      <div className="card p-5"><h2 className="mb-2 font-semibold">Commission Revenue</h2><RevenueBars data={revenue} /></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5"><h2 className="mb-3 font-semibold">Top Routes</h2>
          <ul className="divide-y divide-slate-50 text-sm">{routes.map((r) => <li key={r.origin + r.destination} className="flex justify-between py-2.5"><span>{r.origin} → {r.destination}</span><b>{r._count}</b></li>)}{!routes.length && <li className="py-6 text-center text-slate-400">No data</li>}</ul></div>
        <div className="card p-5"><h2 className="mb-3 flex items-center gap-2 font-semibold"><Trophy className="h-4 w-4 text-amber-500" />Driver Performance</h2>
          <ul className="divide-y divide-slate-50 text-sm">{top.map((t) => <li key={t.driverId} className="flex justify-between py-2.5"><span>{names.find((n) => n.id === t.driverId)?.name}</span><span className="text-slate-500">{t._count} deliveries · <b className="text-slate-800">ETB {(t._sum.price ?? 0).toLocaleString()}</b></span></li>)}{!top.length && <li className="py-6 text-center text-slate-400">No deliveries in this period</li>}</ul></div>
      </div>
    </div>
  );
}
