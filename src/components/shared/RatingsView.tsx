import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import Stars from "./Stars";
export default async function RatingsView({ targetId, title }: { targetId: string; title: string }) {
  const rs = await prisma.review.findMany({ where: { targetId }, include: { author: true }, orderBy: { createdAt: "desc" } });
  const avg = rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-slate-500">See what your customers say about you.</p></div>
      <div className="card grid gap-6 p-6 sm:grid-cols-[200px_1fr]">
        <div className="text-center"><p className="text-5xl font-bold">{rs.length ? avg.toFixed(1) : "—"}</p><Stars n={avg} size="h-5 w-5" /><p className="mt-1 text-xs text-slate-400">{rs.length} review{rs.length !== 1 && "s"}</p></div>
        <div className="space-y-1.5">{[5, 4, 3, 2, 1].map((n) => { const c = rs.filter((r) => r.rating === n).length; return (
          <div key={n} className="flex items-center gap-3 text-xs"><span className="w-3">{n}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${rs.length ? (c / rs.length) * 100 : 0}%` }} /></div><span className="w-6 text-right text-slate-400">{c}</span></div>); })}</div>
      </div>
      <div className="space-y-3">{rs.map((r) => <div key={r.id} className="card p-5"><div className="flex items-center justify-between"><b className="text-sm">{r.author.name}</b><span className="text-xs text-slate-400">{timeAgo(r.createdAt)}</span></div><Stars n={r.rating} />{r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}</div>)}
        {!rs.length && <p className="card py-12 text-center text-sm text-slate-400">No reviews yet.</p>}</div>
    </div>
  );
}
