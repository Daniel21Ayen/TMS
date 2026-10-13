import { ShieldCheck, Percent, Coins, Timer, ScrollText } from "lucide-react";
import type { AuditLog } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import DataTable, { type Column } from "@/components/shared/DataTable";
export const dynamic = "force-dynamic";
const protections = ["Sign-in rate limiting and lockout (5 attempts / 15 min)", "Rate limits on registration, OTP, resets, tickets and chat", "Passwords hashed with bcrypt; OTP codes stored hashed", "Sessions end immediately on suspension or password change", "Audit log of sign-ins and critical admin actions", "Security headers (clickjacking, MIME sniffing, HSTS, CSP in production)"];
export default async function Settings() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  const users = await prisma.user.findMany({ where: { id: { in: [...new Set(logs.map((l) => l.actorId).filter(Boolean) as string[])] } }, select: { id: true, name: true } });
  const name = (id: string | null) => users.find((u) => u.id === id)?.name ?? "System";
  const cols: Column<AuditLog>[] = [
    { header: "When", cell: (l) => <span title={l.createdAt.toISOString()}>{timeAgo(l.createdAt)}</span> }, { header: "Actor", cell: (l) => name(l.actorId) },
    { header: "Action", cell: (l) => <code className={`rounded bg-slate-100 px-2 py-0.5 text-xs ${l.action.includes("failed") ? "text-rose-600" : ""}`}>{l.action}</code> },
    { header: "Target", cell: (l) => l.target ? `#${l.target.slice(-6).toUpperCase()}` : "—" }, { header: "Details", cell: (l) => <span className="text-slate-500">{l.meta ?? ""}</span> }];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">System Settings</h1><p className="text-sm text-slate-500">Platform configuration, security status and audit trail.</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[[Percent, "Commission", "10% per completed trip, load or order"], [Coins, "Currency", "Ethiopian Birr (ETB)"], [Timer, "Session length", "8 hours"]].map(([I, t, d]) => { const Icon = I as typeof Percent; return (
          <div key={t as string} className="card flex items-center gap-3 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></span><div><p className="text-xs text-slate-400">{t as string}</p><p className="text-sm font-semibold">{d as string}</p></div></div>); })}
      </div>
      <div className="card p-5"><h2 className="mb-3 flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-emerald-500" />Security Protections</h2>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">{protections.map((p) => <li key={p} className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{p}</li>)}</ul></div>
      <div className="card"><h2 className="flex items-center gap-2 border-b border-slate-100 p-4 font-semibold"><ScrollText className="h-5 w-5 text-brand-600" />Audit Log</h2><DataTable columns={cols} rows={logs} /></div>
    </div>
  );
}
