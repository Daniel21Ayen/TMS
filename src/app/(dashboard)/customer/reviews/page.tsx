import { Star, PartyPopper } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stars from "@/components/shared/Stars";
import { submitReview } from "@/actions/reviews/submit-review.action";
export const dynamic = "force-dynamic";
const done: OrderStatus = "DELIVERED";
function Rate({ kind, id, label, sub }: { kind: "load" | "order"; id: string; label: string; sub: string }) {
  return (
    <form action={submitReview.bind(null, kind, id)} className="card space-y-3 p-5">
      <div><p className="font-semibold">{label}</p><p className="text-xs text-slate-400">{sub}</p></div>
      <div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => <label key={n} className="cursor-pointer"><input type="radio" name="rating" value={n} required className="peer sr-only" />
        <span className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm peer-checked:border-amber-400 peer-checked:bg-amber-50 peer-checked:text-amber-600">{n}<Star className="h-3.5 w-3.5" /></span></label>)}</div>
      <textarea name="comment" rows={2} maxLength={500} placeholder="Share your experience (optional)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
      <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Submit Review</button>
    </form>);
}
export default async function Reviews() {
  const me = (await getServerSession(authOptions))!.user.id;
  const [loads, orders, mine] = await Promise.all([
    prisma.load.findMany({ where: { postedById: me, status: "DELIVERED", driverId: { not: null } }, include: { driver: true } }),
    prisma.vendorOrder.findMany({ where: { customerId: me, status: done }, include: { product: true, vendor: true } }),
    prisma.review.findMany({ where: { authorId: me }, include: { target: true }, orderBy: { createdAt: "desc" } })]);
  const l = new Set(mine.map((r) => r.loadId)), o = new Set(mine.map((r) => r.orderId));
  const pl = loads.filter((x) => !l.has(x.id)), po = orders.filter((x) => !o.has(x.id));
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Reviews & Ratings</h1><p className="text-sm text-slate-500">Rate your drivers and vendors after delivery.</p></div>
      {!pl.length && !po.length && <div className="card grid place-items-center gap-2 py-12 text-slate-400"><PartyPopper className="h-9 w-9" /><p className="text-sm">Nothing waiting for your review.</p></div>}
      <div className="grid gap-4 lg:grid-cols-2">
        {pl.map((x) => <Rate key={x.id} kind="load" id={x.id} label={`Driver ${x.driver!.name}`} sub={`${x.item} · ${x.origin} → ${x.destination}`} />)}
        {po.map((x) => <Rate key={x.id} kind="order" id={x.id} label={`Vendor ${x.vendor.name}`} sub={`${x.quantity} × ${x.product.name}`} />)}</div>
      {!!mine.length && <div className="card p-5"><h2 className="mb-3 font-semibold">Your Reviews</h2><ul className="divide-y divide-slate-50 text-sm">{mine.map((r) => <li key={r.id} className="flex items-center justify-between py-2.5"><span>{r.target.name}{r.comment && <span className="block text-xs text-slate-400">{r.comment}</span>}</span><Stars n={r.rating} /></li>)}</ul></div>}
    </div>
  );
}
