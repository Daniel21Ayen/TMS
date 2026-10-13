import { Wrench, CheckCircle2, Truck } from "lucide-react";
import type { Prisma, VehicleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import StatusTabs from "@/components/shared/StatusTabs";
import { toggleMaintenance } from "@/actions/admin/set-vehicle-status.action";
import { VEHICLE_ICON } from "@/data/constants/vehicleTypes";
export const dynamic = "force-dynamic";
type Row = Prisma.VehicleGetPayload<{ include: { owner: true } }>;
export default async function Fleet({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status as VehicleStatus | undefined;
  const [rows, groups] = await Promise.all([
    prisma.vehicle.findMany({ where: status ? { status } : {}, include: { owner: true }, orderBy: { plate: "asc" } }),
    prisma.vehicle.groupBy({ by: ["status"], _count: true }),
  ]);
  const n = (s: string) => groups.find((g) => g.status === s)?._count ?? 0;
  const columns: Column<Row>[] = [
    { header: "Vehicle", cell: (v) => { const I = VEHICLE_ICON[v.type] ?? Truck; return <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><I className="h-4 w-4" /></span><div><p className="font-medium">{v.plate}</p><p className="text-xs text-slate-400">{v.type} · {v.capacity ?? "—"}</p></div></div>; } },
    { header: "Driver", cell: (v) => v.owner.name },
    { header: "Status", cell: (v) => <StatusBadge value={v.status} /> },
    { header: "Actions", className: "text-right", cell: (v) => v.status === "INACTIVE" ? null : (
      <form action={toggleMaintenance.bind(null, v.id)}><button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50">
        {v.status === "ACTIVE" ? <><Wrench className="h-4 w-4" />Maintenance</> : <><CheckCircle2 className="h-4 w-4" />Mark Active</>}</button></form>) },
  ];
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Fleet Management</h1><p className="text-sm text-slate-500">Manage vehicles and fleet operations.</p></div>
      <StatusTabs base="/admin/fleet-management" current={status} tabs={[{ label: "All Vehicles", count: groups.reduce((a, g) => a + g._count, 0) }, { label: "Active", value: "ACTIVE", count: n("ACTIVE") }, { label: "Maintenance", value: "MAINTENANCE", count: n("MAINTENANCE") }, { label: "Inactive", value: "INACTIVE", count: n("INACTIVE") }]} />
      <div className="card"><DataTable columns={columns} rows={rows} /></div>
    </div>
  );
}
