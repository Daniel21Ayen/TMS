import { Wallet, ShoppingBag, Receipt, Gauge } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { etb, lastDays } from "@/lib/utils";
import StatCard from "@/components/shared/StatCard";
import { RevenueBars, StatusDonut } from "@/components/admin/Dashboard/Charts";
export const dynamic = "force-dynamic";
export default async function Analysis() {
  const s = await getServerSession(authOptions), days = lastDays(14);
  const orders = await prisma.vendorOrder.findMany({ where: { vendorId: s!.user.id, createdAt: { gte: days[0] }, status: { not: "CANCELLED" } }, include: { product: true } });
  const done = orders.filter((o) => o.status === "DELIVERED"), sales = done.reduce((a, o) => a + o.total, 0);
  const series = days.map((d) => ({ day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), revenue: done.filter((o) => o.createdAt.toDateString() === d.toDateString()).reduce((a, o) => a + o.total, 0) }));
  const byCat = Object.entries(orders.reduce<Record<string, number>>((m, o) => ((m[o.product.category] = (m[o.product.category] ?? 0) + 1), m), {})).map(([name, value]) => ({ name, value }));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Analysis</h1><p className="text-sm text-slate-500">Your business performance over the last 14 days.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Sales" value={etb(sales)} icon={Wallet} /><StatCard label="Orders" value={String(orders.length)} icon={ShoppingBag} tone="green" />
        <StatCard label="Avg. Order Value" value={done.length ? etb(Math.round(sales / done.length)) : "—"} icon={Receipt} tone="violet" /><StatCard label="Fulfilment Rate" value={orders.length ? `${Math.round((done.length / orders.length) * 100)}%` : "—"} icon={Gauge} tone="orange" /></div>
      <div className="grid gap-4 lg:grid-cols-3"><div className="card p-5 lg:col-span-2"><h2 className="mb-2 font-semibold">Sales Overview</h2><RevenueBars data={series} /></div>
        <div className="card p-5"><h2 className="mb-2 font-semibold">Top Categories</h2><StatusDonut data={byCat} /></div></div>
    </div>
  );
}
