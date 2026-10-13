import { Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
export default async function WalletView({ userId, title, subtitle, children }: { userId: string; title: string; subtitle: string; children?: React.ReactNode }) {
  const w = await prisma.wallet.findUnique({ where: { userId }, include: { transactions: { orderBy: { createdAt: "desc" }, take: 10 } } });
  const money = (n: unknown) => `ETB ${Number(n).toLocaleString()}`;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-slate-500">{subtitle}</p></div>
      <div className="card flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-white p-6">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600"><Wallet className="h-7 w-7" /></span>
        <div><p className="text-xs text-slate-500">Available Balance</p><p className="text-3xl font-bold">{money(w?.balance ?? 0)}</p></div>
      </div>
      {children}
      <div className="card p-5"><h2 className="mb-3 font-semibold">Recent Transactions</h2>
        {!w?.transactions.length && <p className="py-8 text-center text-sm text-slate-400">No transactions yet.</p>}
        <ul className="divide-y divide-slate-50">{w?.transactions.map((t) => { const inc = t.type === "EARNING" || t.type === "DEPOSIT" || t.type === "REFUND"; return (
          <li key={t.id} className="flex items-center gap-3 py-3">
            <span className={`grid h-9 w-9 place-items-center rounded-lg ${inc ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>{inc ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</span>
            <div className="flex-1"><p className="text-sm font-medium">{t.note ?? t.type}</p><p className="text-xs text-slate-400">{t.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></div>
            <p className={`text-sm font-semibold ${inc ? "text-emerald-600" : "text-rose-500"}`}>{inc ? "+" : "-"}{money(t.amount)}</p></li>); })}</ul></div>
    </div>
  );
}
