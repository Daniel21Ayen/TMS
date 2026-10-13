import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, UserCheck, UserX, ShieldCheck } from "lucide-react";
import type { Prisma, Role, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { toggleUserStatus } from "@/actions/admin/manage-user.action";

const PAGE = 8;
type SP = { q?: string; status?: string; role?: string; page?: string };

export default async function UserList({ title, subtitle, basePath, role, sp }: { title: string; subtitle: string; basePath: string; role?: Role; sp: SP }) {
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : sp.role ? { role: sp.role as Role } : {}),
    ...(sp.status ? { status: sp.status as User["status"] } : {}),
    ...(sp.q ? { OR: [{ name: { contains: sp.q, mode: "insensitive" } }, { email: { contains: sp.q, mode: "insensitive" } }] } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
    prisma.user.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const href = (p: number) => `${basePath}?${new URLSearchParams({ ...(sp.q && { q: sp.q }), ...(sp.status && { status: sp.status }), ...(sp.role && { role: sp.role }), page: String(p) })}`;

  const columns: Column<User>[] = [
    { header: "Name", cell: (u) => <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">{u.name[0]}</span><div><Link href={`/admin/users/${u.id}`} className="font-medium hover:text-brand-600">{u.name}</Link><p className="text-xs text-slate-400">{u.email}</p></div></div> },
    { header: "Phone", cell: (u) => u.phone ?? "—" },
    ...(!role ? [{ header: "Role", cell: (u: User) => <StatusBadge value={u.role} /> }] : []),
    { header: "Status", cell: (u) => <span className="flex items-center gap-1.5"><StatusBadge value={u.status} />{u.verified && <ShieldCheck className="h-4 w-4 text-emerald-500" aria-label="Verified" />}</span> },
    { header: "Joined", cell: (u) => u.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
    { header: "Actions", className: "text-right", cell: (u) => u.role === "ADMIN" ? null : (
      <form action={toggleUserStatus.bind(null, u.id)}>
        <button className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${u.status === "ACTIVE" ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"}`}>
          {u.status === "ACTIVE" ? <><UserX className="h-4 w-4" />Suspend</> : <><UserCheck className="h-4 w-4" />{u.status === "PENDING" ? "Verify" : "Activate"}</>}
        </button>
      </form>) },
  ];

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">{title}</h1><p className="text-sm text-slate-500">{subtitle}</p></div>
      <div className="card">
        <form className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input name="q" defaultValue={sp.q} placeholder="Search by name or email..." className="w-full rounded-xl bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/30" /></div>
          {!role && <select name="role" defaultValue={sp.role ?? ""} className="rounded-xl bg-slate-50 px-3 py-2 text-sm"><option value="">All roles</option>{["CUSTOMER", "DRIVER", "VENDOR", "ADMIN"].map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}</select>}
          <select name="status" defaultValue={sp.status ?? ""} className="rounded-xl bg-slate-50 px-3 py-2 text-sm"><option value="">All status</option><option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="SUSPENDED">Suspended</option></select>
          <button className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700">Apply</button>
        </form>
        <DataTable columns={columns} rows={rows} />
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>{total} result{total !== 1 && "s"} · Page {page} of {pages}</span>
          <div className="flex gap-2">
            <Link aria-disabled={page <= 1} href={href(page - 1)} className={`rounded-lg p-2 hover:bg-slate-100 ${page <= 1 ? "pointer-events-none opacity-30" : ""}`}><ChevronLeft className="h-4 w-4" /></Link>
            <Link aria-disabled={page >= pages} href={href(page + 1)} className={`rounded-lg p-2 hover:bg-slate-100 ${page >= pages ? "pointer-events-none opacity-30" : ""}`}><ChevronRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
