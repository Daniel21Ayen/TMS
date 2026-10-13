import { Users, Car, Package, Percent, UserPlus, CreditCard, PackagePlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import StatCard from "@/components/shared/StatCard";
import { ActivityChart, StatusDonut } from "@/components/admin/Dashboard/Charts";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  const since = new Date(); since.setDate(since.getDate() - 6); since.setHours(0, 0, 0, 0);
  const [users, drivers, totalLoads, comm, loads7, comm7, byStatus, newUsers, reqs] = await Promise.all([
    prisma.user.count(), prisma.user.count({ where: { role: "DRIVER", status: "ACTIVE" } }), prisma.load.count(), prisma.commission.aggregate({ _sum: { amount: true } }),
    prisma.load.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, item: true }, orderBy: { createdAt: "desc" } }),
    prisma.commission.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.load.groupBy({ by: ["status"], _count: true }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 4 }), prisma.paymentRequest.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(since); d.setDate(d.getDate() + i); return d; });
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const series = days.map((d) => ({ day: d.toLocaleDateString("en-GB", { weekday: "short" }), Shipments: loads7.filter((l) => same(l.createdAt, d)).length, Deliveries: comm7.filter((c) => same(c.createdAt, d)).length }));
  const events = [
    ...newUsers.map((u) => ({ icon: UserPlus, t: `New ${u.role.toLowerCase()}: ${u.name}`, at: u.createdAt })),
    ...loads7.slice(0, 3).map((l) => ({ icon: PackagePlus, t: `Shipment posted: ${l.item}`, at: l.createdAt })),
    ...reqs.map((r) => ({ icon: CreditCard, t: `${r.kind === "TOPUP" ? "Top-up" : "Withdrawal"} request: ETB ${r.amount.toLocaleString()}`, at: r.createdAt })),
  ].sort((a, b) => +b.at - +a.at).slice(0, 6);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-sm text-slate-500">Welcome back, Admin! Here&apos;s what&apos;s happening with your platform.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={users.toLocaleString()} icon={Users} /><StatCard label="Active Drivers" value={drivers.toLocaleString()} icon={Car} tone="green" />
        <StatCard label="Total Shipments" value={totalLoads.toLocaleString()} icon={Package} tone="violet" /><StatCard label="Commission Revenue" value={`ETB ${(comm._sum.amount ?? 0).toLocaleString()}`} icon={Percent} tone="orange" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2"><h2 className="mb-2 font-semibold">Platform Activity · Last 7 days</h2><ActivityChart data={series} /></div>
        <div className="card p-5"><h2 className="mb-2 font-semibold">Shipments by Status</h2><StatusDonut data={byStatus.map((s) => ({ name: s.status.replace("_", " "), value: s._count }))} /></div>
      </div>
      <div className="card p-5"><h2 className="font-semibold">Recent Activities</h2>
        <ul className="mt-4 space-y-4">{events.map(({ icon: I, t, at }, i) => (
          <li key={i} className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><I className="h-4 w-4" /></span><span className="flex-1 text-sm">{t}</span><span className="text-xs text-slate-400">{timeAgo(at)}</span></li>))}</ul></div>
    </div>
  );
}
