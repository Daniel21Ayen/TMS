import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, SendHorizonal, CheckCircle2, Loader, RotateCcw } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supportPath } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import { replyTicket, setTicketStatus } from "@/actions/support/ticket.action";
export const dynamic = "force-dynamic";
export default async function Thread({ params }: { params: { id: string } }) {
  const s = (await getServerSession(authOptions))!, admin = s.user.role === "ADMIN";
  const t = await prisma.ticket.findUnique({ where: { id: params.id }, include: { user: true, replies: { include: { author: true }, orderBy: { createdAt: "asc" } } } });
  if (!t || (!admin && t.userId !== s.user.id)) notFound();
  const btn = "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium";
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={supportPath(s.user.role)} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" />Back to support</Link>
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div><h1 className="text-xl font-bold">{t.subject}</h1><p className="text-sm text-slate-500">{t.category} · from {t.user.name}</p></div>
        <div className="flex items-center gap-2"><StatusBadge value={t.priority} /><StatusBadge value={t.status} /></div>
        {admin && <div className="flex w-full gap-2 border-t border-slate-100 pt-3">
          {t.status === "OPEN" && <form action={setTicketStatus.bind(null, t.id, "IN_PROGRESS")}><button className={`${btn} bg-amber-50 text-amber-600`}><Loader className="h-3.5 w-3.5" />In progress</button></form>}
          {t.status !== "RESOLVED" ? <form action={setTicketStatus.bind(null, t.id, "RESOLVED")}><button className={`${btn} bg-emerald-50 text-emerald-600`}><CheckCircle2 className="h-3.5 w-3.5" />Mark resolved</button></form>
            : <form action={setTicketStatus.bind(null, t.id, "OPEN")}><button className={`${btn} bg-brand-50 text-brand-600`}><RotateCcw className="h-3.5 w-3.5" />Reopen</button></form>}</div>}
      </div>
      <div className="space-y-3">{t.replies.map((r) => { const staff = r.author.role === "ADMIN"; return (
        <div key={r.id} className={`flex ${staff ? "" : "justify-end"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${staff ? "bg-white shadow-card" : "bg-brand-600 text-white"}`}>
          <p className={`mb-1 text-xs font-semibold ${staff ? "text-brand-600" : "text-white/70"}`}>{staff ? `Support · ${r.author.name}` : r.author.name}</p><p className="whitespace-pre-wrap break-words">{r.body}</p></div></div>); })}</div>
      <form action={replyTicket.bind(null, t.id)} className="card flex gap-2 p-3">
        <input name="body" required maxLength={2000} autoComplete="off" placeholder={t.status === "RESOLVED" && !admin ? "Reply to reopen this ticket..." : "Write a reply..."} className="flex-1 rounded-xl bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
        <button title="Send" className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700"><SendHorizonal className="h-5 w-5" /></button></form>
    </div>
  );
}
