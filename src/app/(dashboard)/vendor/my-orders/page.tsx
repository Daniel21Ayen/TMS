import { Check, X, Play, PackageCheck } from "lucide-react";
import type { OrderStatus, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { etb } from "@/lib/utils";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import StatusTabs from "@/components/shared/StatusTabs";
import { updateOrder } from "@/actions/vendor/update-order.action";
export const dynamic = "force-dynamic";
type Row = Prisma.VendorOrderGetPayload<{ include: { product: true; customer: true } }>;
const B = ({ id, to, icon: I, label, tone }: { id: string; to: OrderStatus; icon: typeof Check; label: string; tone: string }) =>
  <form action={updateOrder.bind(null, id, to)}><button className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium ${tone}`}><I className="h-3.5 w-3.5" />{label}</button></form>;
export default async function Orders({ searchParams }: { searchParams: { status?: string } }) {
  const s = await getServerSession(authOptions), status = searchParams.status as OrderStatus | undefined;
  const [rows, groups] = await Promise.all([
    prisma.vendorOrder.findMany({ where: { vendorId: s!.user.id, ...(status && { status }) }, include: { product: true, customer: true }, orderBy: { createdAt: "desc" } }),
    prisma.vendorOrder.groupBy({ by: ["status"], where: { vendorId: s!.user.id }, _count: true })]);
  const n = (k: string) => groups.find((g) => g.status === k)?._count ?? 0;
  const ok = "bg-emerald-50 text-emerald-600 hover:bg-emerald-100", no = "bg-rose-50 text-rose-600 hover:bg-rose-100", go = "bg-brand-50 text-brand-600 hover:bg-brand-100";
  const cols: Column<Row>[] = [
    { header: "Order", cell: (o) => `#${o.id.slice(-6).toUpperCase()}` }, { header: "Item", cell: (o) => `${o.quantity} × ${o.product.name}` }, { header: "Customer", cell: (o) => o.customer.name },
    { header: "Total", cell: (o) => <b>{etb(o.total)}</b> }, { header: "Status", cell: (o) => <StatusBadge value={o.status} /> }, { header: "Date", cell: (o) => o.createdAt.toLocaleDateString("en-GB") },
    { header: "Actions", className: "text-right", cell: (o) => <div className="flex justify-end gap-2">
      {o.status === "PENDING" && <B id={o.id} to="CONFIRMED" icon={Check} label="Confirm" tone={ok} />}
      {o.status === "CONFIRMED" && <B id={o.id} to="PROCESSING" icon={Play} label="Process" tone={go} />}
      {o.status === "PROCESSING" && <B id={o.id} to="DELIVERED" icon={PackageCheck} label="Delivered" tone={ok} />}
      {["PENDING", "CONFIRMED"].includes(o.status) && <B id={o.id} to="CANCELLED" icon={X} label="Cancel" tone={no} />}</div> }];
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">My Orders</h1><p className="text-sm text-slate-500">Track and manage your incoming orders.</p></div>
      <StatusTabs base="/vendor/my-orders" current={status} tabs={[{ label: "All", count: groups.reduce((a, g) => a + g._count, 0) }, ...(["PENDING", "CONFIRMED", "PROCESSING", "DELIVERED"] as const).map((k) => ({ label: k[0] + k.slice(1).toLowerCase(), value: k, count: n(k) }))]} />
      <div className="card"><DataTable columns={cols} rows={rows} /></div>
    </div>
  );
}
