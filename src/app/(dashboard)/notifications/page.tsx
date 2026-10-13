import { BellRing, BellOff, CheckCheck } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import { markAllRead } from "@/actions/notifications/mark-read.action";
export const dynamic = "force-dynamic";
export default async function Notifications() {
  const s = await getServerSession(authOptions);
  const items = await prisma.notification.findMany({ where: { userId: s!.user.id }, orderBy: { createdAt: "desc" }, take: 30 });
  const unread = items.filter((n) => !n.read).length;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-sm text-slate-500">{unread} unread</p></div>
        {unread > 0 && <form action={markAllRead}><button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-brand-600 shadow-card hover:bg-brand-50"><CheckCheck className="h-4 w-4" />Mark all as read</button></form>}</div>
      {!items.length && <div className="card grid place-items-center gap-2 py-16 text-slate-400"><BellOff className="h-10 w-10" /><p className="text-sm">You&apos;re all caught up.</p></div>}
      <ul className="space-y-2">{items.map((n) => (
        <li key={n.id} className={`card flex items-start gap-3 p-4 ${n.read ? "" : "border-brand-100 bg-brand-50/40"}`}>
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${n.read ? "bg-slate-100 text-slate-400" : "bg-brand-100 text-brand-600"}`}><BellRing className="h-5 w-5" /></span>
          <div className="flex-1"><p className="text-sm font-semibold">{n.title}</p><p className="text-sm text-slate-500">{n.body}</p></div>
          <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span></li>))}</ul>
    </div>
  );
}
