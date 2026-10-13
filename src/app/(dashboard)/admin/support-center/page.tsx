import Link from "next/link";
import { Eye } from "lucide-react";
import type { Prisma, TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import StatusTabs from "@/components/shared/StatusTabs";
export const dynamic = "force-dynamic";
type Row = Prisma.TicketGetPayload<{ include: { user: true } }>;
export default async function AdminSupport({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status as TicketStatus | undefined;
  const [rows, groups] = await Promise.all([
    prisma.ticket.findMany({ where: status ? { status } : {}, include: { user: true }, orderBy: [{ status: "asc" }, { updatedAt: "desc" }], take: 50 }),
    prisma.ticket.groupBy({ by: ["status"], _count: true })]);
  const n = (k: string) => groups.find((g) => g.status === k)?._count ?? 0;
  const cols: Column<Row>[] = [
    { header: "Ticket", cell: (t) => <div><p className="font-medium">{t.subject}</p><p className="text-xs text-slate-400">#{t.id.slice(-6).toUpperCase()} · {t.category}</p></div> },
    { header: "From", cell: (t) => <div><p>{t.user.name}</p><p className="text-xs capitalize text-slate-400">{t.user.role.toLowerCase()}</p></div> },
    { header: "Priority", cell: (t) => <StatusBadge value={t.priority} /> }, { header: "Status", cell: (t) => <StatusBadge value={t.status} /> },
    { header: "Updated", cell: (t) => timeAgo(t.updatedAt) },
    { header: "Actions", className: "text-right", cell: (t) => <Link href={`/support/${t.id}`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"><Eye className="h-4 w-4" />View</Link> }];
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Support Center</h1><p className="text-sm text-slate-500">Manage support tickets and customer inquiries.</p></div>
      <StatusTabs base="/admin/support-center" current={status} tabs={[{ label: "All Tickets", count: groups.reduce((a, g) => a + g._count, 0) }, { label: "Open", value: "OPEN", count: n("OPEN") }, { label: "In Progress", value: "IN_PROGRESS", count: n("IN_PROGRESS") }, { label: "Resolved", value: "RESOLVED", count: n("RESOLVED") }]} />
      <div className="card"><DataTable columns={cols} rows={rows} /></div>
    </div>
  );
}
