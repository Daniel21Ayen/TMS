import Link from "next/link";
import { LifeBuoy, Send, AlertCircle, ChevronRight, Ticket, Tag, Flag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import { SUPPORT_CATEGORIES } from "@/data/constants/support";
import { createTicket } from "@/actions/support/ticket.action";
import StatusBadge from "./StatusBadge";
const field = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
export default async function SupportCenter({ userId, error }: { userId: string; error?: string }) {
  const tickets = await prisma.ticket.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 20 });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Support Center</h1><p className="text-sm text-slate-500">We&apos;re here to help you. Open a ticket and our team will reply.</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <form action={createTicket} className="card space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-semibold"><LifeBuoy className="h-5 w-5 text-brand-600" />New Ticket</h2>
          {error && <p className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{error}</p>}
          <input name="subject" required maxLength={100} placeholder="Subject" className={field} />
          <div className="grid grid-cols-2 gap-3">
            <label className="relative"><Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><select name="category" className={`${field} pl-9`}>{SUPPORT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="relative"><Flag className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><select name="priority" defaultValue="MEDIUM" className={`${field} pl-9`}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label></div>
          <textarea name="message" required rows={4} maxLength={2000} placeholder="Describe your issue..." className={field} />
          <button className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"><Send className="h-4 w-4" />Submit Ticket</button>
        </form>
        <div className="card p-6"><h2 className="mb-3 flex items-center gap-2 font-semibold"><Ticket className="h-5 w-5 text-brand-600" />My Tickets</h2>
          <ul className="divide-y divide-slate-50">{tickets.map((t) => (
            <li key={t.id}><Link href={`/support/${t.id}`} className="flex items-center gap-3 py-3 hover:text-brand-600"><span className="min-w-0 flex-1"><b className="block truncate text-sm">{t.subject}</b><span className="text-xs text-slate-400">{t.category} · {timeAgo(t.updatedAt)}</span></span><StatusBadge value={t.status} /><ChevronRight className="h-4 w-4 text-slate-300" /></Link></li>))}
            {!tickets.length && <li className="py-10 text-center text-sm text-slate-400">No tickets yet.</li>}</ul></div>
      </div>
    </div>
  );
}
