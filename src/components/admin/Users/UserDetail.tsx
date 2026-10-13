import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, CalendarDays, Wallet, Star, Eye, Check, X, UserX, UserCheck, AlertCircle, FileCheck2, BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { etb } from "@/lib/utils";
import { DOC_LABEL, REQUIRED } from "@/data/constants/documents";
import StatusBadge from "@/components/shared/StatusBadge";
import { toggleUserStatus } from "@/actions/admin/manage-user.action";
import { reviewDocument } from "@/actions/documents/document.action";
export default async function UserDetail({ id, error }: { id: string; error?: string }) {
  const u = await prisma.user.findUnique({ where: { id }, include: { wallet: true } });
  if (!u) notFound();
  const [docs, rating, a, b, c] = await Promise.all([
    prisma.document.findMany({ where: { userId: id }, select: { id: true, kind: true, filename: true, size: true, status: true, note: true }, orderBy: { createdAt: "asc" } }),
    prisma.review.aggregate({ where: { targetId: id }, _avg: { rating: true }, _count: true }),
    u.role === "DRIVER" ? prisma.vehicle.count({ where: { ownerId: id } }) : u.role === "VENDOR" ? prisma.product.count({ where: { vendorId: id } }) : prisma.load.count({ where: { postedById: id } }),
    u.role === "DRIVER" ? prisma.load.count({ where: { driverId: id, status: "DELIVERED" } }) : u.role === "VENDOR" ? prisma.vendorOrder.count({ where: { vendorId: id } }) : prisma.booking.count({ where: { customerId: id } }),
    u.role === "DRIVER" ? prisma.trip.count({ where: { driverId: id } }) : prisma.vendorOrder.count({ where: { customerId: id } })]);
  const labels: Record<string, string[]> = { DRIVER: ["Vehicles", "Deliveries", "Trips"], VENDOR: ["Products", "Orders received", "Orders placed"], CUSTOMER: ["Shipments", "Bookings", "Marketplace orders"], ADMIN: ["", "", ""] };
  const required = REQUIRED[u.role] ?? [], approved = required.filter((k) => docs.some((d) => d.kind === k && d.status === "APPROVED")).length;
  const stats: [string, string][] = [["Wallet", etb(Number(u.wallet?.balance ?? 0))], ["Rating", rating._count ? `${rating._avg.rating!.toFixed(1)} (${rating._count})` : "—"], ...(u.role === "ADMIN" ? [] : ([a, b, c] as number[]).map((v, i) => [labels[u.role][i], String(v)] as [string, string]))];
  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" />Back to users</Link>
      {error && <p className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{error}</p>}
      <div className="card flex flex-wrap items-center gap-5 p-6">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-2xl font-bold text-brand-600">{u.name[0]}</span>
        <div className="min-w-[220px] flex-1"><h1 className="flex items-center gap-2 text-2xl font-bold">{u.name}{u.verified && <BadgeCheck className="h-5 w-5 text-emerald-500" />}</h1>
          <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500"><span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{u.email}</span><span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{u.phone ?? "—"}</span><span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Joined {u.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}</span></div></div>
        <div className="flex items-center gap-2"><StatusBadge value={u.role} /><StatusBadge value={u.status} />
          {u.role !== "ADMIN" && <form action={toggleUserStatus.bind(null, u.id)}><button className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium ${u.status === "ACTIVE" ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
            {u.status === "ACTIVE" ? <><UserX className="h-4 w-4" />Suspend</> : <><UserCheck className="h-4 w-4" />{u.status === "PENDING" ? "Verify" : "Activate"}</>}</button></form>}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats.map(([l, v]) => <div key={l} className="card p-4"><p className="flex items-center gap-1.5 text-xs text-slate-400">{l === "Wallet" ? <Wallet className="h-3.5 w-3.5" /> : l === "Rating" ? <Star className="h-3.5 w-3.5" /> : null}{l}</p><p className="mt-1 text-xl font-bold">{v}</p></div>)}</div>
      {!!required.length && <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold"><FileCheck2 className="h-5 w-5 text-brand-600" />Verification Documents <span className="text-xs font-normal text-slate-400">{approved}/{required.length} approved</span></h2>
        <ul className="divide-y divide-slate-50">{required.map((k) => { const d = docs.find((x) => x.kind === k); return (
          <li key={k} className="flex flex-wrap items-center gap-3 py-3 text-sm"><span className="min-w-[180px] flex-1"><b>{DOC_LABEL[k]}</b>{d && <span className="block text-xs text-slate-400">{d.filename} · {(d.size / 1024).toFixed(0)} KB{d.note && ` · ${d.note}`}</span>}</span>
            {d ? <><StatusBadge value={d.status} /><a href={`/api/documents/${d.id}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600"><Eye className="h-3.5 w-3.5" />View</a>
              {d.status === "PENDING" && <div className="flex items-center gap-2">
                <form action={reviewDocument.bind(null, d.id, true)}><button className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100"><Check className="h-3.5 w-3.5" />Approve</button></form>
                <form action={reviewDocument.bind(null, d.id, false)} className="flex gap-1"><input name="note" placeholder="Reason" className="w-28 rounded-lg border border-slate-200 px-2 text-xs" /><button className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100"><X className="h-3.5 w-3.5" />Reject</button></form></div>}</>
              : <span className="text-xs text-slate-400">Not uploaded</span>}</li>); })}</ul></div>}
    </div>
  );
}
