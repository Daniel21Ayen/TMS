import { ArrowDownToLine, ArrowUpFromLine, AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { RequestKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import StatusBadge from "./StatusBadge";
import { PAYMENT_METHODS, methodLabel } from "@/data/constants/paymentMethods";
const input = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
export default async function RequestPanel({ kind, action, userId, error, ok }: { kind: RequestKind; action: (fd: FormData) => Promise<void>; userId: string; error?: string; ok?: string }) {
  const top = kind === "TOPUP", Icon = top ? ArrowDownToLine : ArrowUpFromLine;
  const recent = await prisma.paymentRequest.findMany({ where: { userId, kind }, orderBy: { createdAt: "desc" }, take: 5 });
  return (
    <div className="card space-y-4 p-5">
      <h2 className="flex items-center gap-2 font-semibold"><Icon className="h-5 w-5 text-brand-600" />{top ? "Add Money" : "Withdraw Earnings"}</h2>
      <p className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700"><Info className="mt-0.5 h-4 w-4 shrink-0" />{top ? "Send the money via Telebirr, CBE Birr or bank transfer, then enter the receipt number. Your wallet is credited once an admin verifies the payment." : "Funds are held when you submit and paid out after admin approval. If rejected, they return to your wallet."}</p>
      {error && <p className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{error}</p>}
      {ok && <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />Request submitted for review.</p>}
      <form action={action} className="grid gap-3 sm:grid-cols-4">
        <input name="amount" type="number" min={50} required placeholder="Amount (ETB)" className={input} />
        <select name="method" className={input}>{PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
        <input name="reference" required placeholder={top ? "Receipt / transaction no." : "Phone or account no."} className={input} />
        <button className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Submit</button>
      </form>
      {!!recent.length && <ul className="divide-y divide-slate-50 text-sm">{recent.map((r) => <li key={r.id} className="flex items-center justify-between py-2"><span>ETB {r.amount.toLocaleString()} · {methodLabel(r.method)}</span><StatusBadge value={r.status} /></li>)}</ul>}
    </div>
  );
}
