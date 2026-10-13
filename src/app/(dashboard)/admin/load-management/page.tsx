import { Package, ArrowRight } from "lucide-react";
import type { LoadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import StatusTabs from "@/components/shared/StatusTabs";
export const dynamic = "force-dynamic";
type Row = Prisma.LoadGetPayload<{ include: { postedBy: true; driver: true } }>;
export default async function Loads({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status as LoadStatus | undefined;
  const [rows, groups] = await Promise.all([
    prisma.load.findMany({ where: status ? { status } : {}, include: { postedBy: true, driver: true }, orderBy: { createdAt: "desc" } }),
    prisma.load.groupBy({ by: ["status"], _count: true }),
  ]);
  const n = (s: string) => groups.find((g) => g.status === s)?._count ?? 0;
  const columns: Column<Row>[] = [
    { header: "Item", cell: (l) => <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Package className="h-4 w-4" /></span><span className="font-medium">{l.item}</span></div> },
    { header: "Route", cell: (l) => <span className="flex items-center gap-1.5">{l.origin}<ArrowRight className="h-3 w-3 text-slate-400" />{l.destination}</span> },
    { header: "Weight", cell: (l) => `${l.weightKg.toLocaleString()} kg` },
    { header: "Price", cell: (l) => `ETB ${l.price.toLocaleString()}` },
    { header: "Posted by", cell: (l) => l.postedBy.name },
    { header: "Driver", cell: (l) => l.driver?.name ?? "—" },
    { header: "Status", cell: (l) => <StatusBadge value={l.status} /> },
  ];
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Load Management</h1><p className="text-sm text-slate-500">Manage loads and cargo shipments.</p></div>
      <StatusTabs base="/admin/load-management" current={status} tabs={[{ label: "All Loads", count: groups.reduce((a, g) => a + g._count, 0) }, { label: "Available", value: "AVAILABLE", count: n("AVAILABLE") }, { label: "Reserved", value: "RESERVED", count: n("RESERVED") }, { label: "In Transit", value: "IN_TRANSIT", count: n("IN_TRANSIT") }, { label: "Delivered", value: "DELIVERED", count: n("DELIVERED") }]} />
      <div className="card"><DataTable columns={columns} rows={rows} /></div>
    </div>
  );
}
