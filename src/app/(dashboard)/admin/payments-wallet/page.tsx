import { Percent, Wallet, Clock, Check, X, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/shared/StatCard";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { methodLabel } from "@/data/constants/paymentMethods";
import { reviewRequest } from "@/actions/admin/review-payment.action";
export const dynamic = "force-dynamic";
type Row = Prisma.PaymentRequestGetPayload<{ include: { user: true } }>;
const fmt = (n: unknown) => `ETB ${Number(n ?? 0).toLocaleString()}`;
export default async function Payments() {
  const [pending, history, comm, bal] = await Promise.all([
    prisma.paymentRequest.findMany({ where: { status: "PENDING" }, include: { user: true }, orderBy: { createdAt: "asc" } }),
    prisma.paymentRequest.findMany({ where: { status: { not: "PENDING" } }, include: { user: true }, orderBy: { reviewedAt: "desc" }, take: 8 }),
    prisma.commission.aggregate({ _sum: { amount: true } }), prisma.wallet.aggregate({ _sum: { balance: true } }),
  ]);
  const base: Column<Row>[] = [
    { header: "User", cell: (r) => <div><p className="font-medium">{r.user.name}</p><p className="text-xs text-slate-400">{r.user.role.toLowerCase()}</p></div> },
    { header: "Type", cell: (r) => <span className="flex items-center gap-1.5">{r.kind === "TOPUP" ? <ArrowDownToLine className="h-4 w-4 text-emerald-500" /> : <ArrowUpFromLine className="h-4 w-4 text-orange-500" />}{r.kind === "TOPUP" ? "Top-up" : "Withdrawal"}</span> },
    { header: "Amount", cell: (r) => <b>{fmt(r.amount)}</b> },
    { header: "Method / Ref", cell: (r) => <div><p>{methodLabel(r.method)}</p><p className="text-xs text-slate-400">{r.reference}</p></div> },
  ];
  const btn = "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium";
  const pendingCols: Column<Row>[] = [...base, { header: "Actions", className: "text-right", cell: (r) => (
    <div className="flex justify-end gap-2">
      <form action={reviewRequest.bind(null, r.id, true)}><button className={`${btn} bg-emerald-50 text-emerald-600 hover:bg-emerald-100`}><Check className="h-4 w-4" />Approve</button></form>
      <form action={reviewRequest.bind(null, r.id, false)}><button className={`${btn} bg-rose-50 text-rose-600 hover:bg-rose-100`}><X className="h-4 w-4" />Reject</button></form></div>) }];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Payments & Wallets</h1><p className="text-sm text-slate-500">Verify payments, approve payouts and track platform revenue.</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Commission Revenue" value={fmt(comm._sum.amount)} icon={Percent} tone="green" />
        <StatCard label="Total in Wallets" value={fmt(bal._sum.balance)} icon={Wallet} tone="violet" />
        <StatCard label="Pending Requests" value={String(pending.length)} icon={Clock} tone="orange" />
      </div>
      <div className="card"><h2 className="border-b border-slate-100 p-4 font-semibold">Pending Review</h2><DataTable columns={pendingCols} rows={pending} /></div>
      <div className="card"><h2 className="border-b border-slate-100 p-4 font-semibold">Recently Reviewed</h2>
        <DataTable columns={[...base, { header: "Status", cell: (r: Row) => <StatusBadge value={r.status} /> }]} rows={history} /></div>
    </div>
  );
}
