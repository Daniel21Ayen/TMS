import { ShoppingBag, Clock, Wallet, Tag } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { etb, lastDays } from "@/lib/utils";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { RevenueBars } from "@/components/admin/Dashboard/Charts";
export const dynamic = "force-dynamic";
export default async function VendorDashboard() {
  const s = await getServerSession(authOptions), id = s!.user.id, days = lastDays(7);
  const [total, pending, rev, offers, recent, week] = await Promise.all([
    prisma.vendorOrder.count({ where: { vendorId: id } }), prisma.vendorOrder.count({ where: { vendorId: id, status: "PENDING" } }),
    prisma.vendorOrder.aggregate({ where: { vendorId: id, status: "DELIVERED" }, _sum: { total: true } }),
    prisma.product.count({ where: { vendorId: id, stock: { gt: 0 }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } }),
    prisma.vendorOrder.findMany({ where: { vendorId: id }, include: { product: true, customer: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.vendorOrder.findMany({ where: { vendorId: id, status: "DELIVERED", createdAt: { gte: days[0] } }, select: { total: true, createdAt: true } })]);
  const series = days.map((d) => ({ day: d.toLocaleDateString("en-GB", { weekday: "short" }), revenue: week.filter((o) => o.createdAt.toDateString() === d.toDateString()).reduce((a, o) => a + o.total, 0) }));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Good Morning, {s!.user.name?.split(" ")[0]}! 👋</h1><p className="text-sm text-slate-500">Here&apos;s what&apos;s happening with your business today.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={String(total)} icon={ShoppingBag} tone="green" /><StatCard label="Pending Orders" value={String(pending)} icon={Clock} tone="orange" />
        <StatCard label="Total Revenue" value={etb(rev._sum.total ?? 0)} icon={Wallet} tone="violet" /><StatCard label="Active Offers" value={String(offers)} icon={Tag} /></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5"><h2 className="mb-3 font-semibold">Recent Orders</h2><ul className="divide-y divide-slate-50 text-sm">{recent.map((o) => <li key={o.id} className="flex items-center justify-between py-2.5"><span>{o.quantity} × {o.product.name}<span className="block text-xs text-slate-400">{o.customer.name}</span></span><span className="flex items-center gap-3"><b>{etb(o.total)}</b><StatusBadge value={o.status} /></span></li>)}{!recent.length && <li className="py-8 text-center text-slate-400">No orders yet</li>}</ul></div>
        <div className="card p-5"><h2 className="mb-2 font-semibold">Sales Overview · 7 days</h2><RevenueBars data={series} /></div></div>
    </div>
  );
}
