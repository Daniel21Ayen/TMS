import Link from "next/link";
import { Plus } from "lucide-react";
import type { Product } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { etb, productStatus } from "@/lib/utils";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
export const dynamic = "force-dynamic";
export default async function Offers() {
  const s = await getServerSession(authOptions);
  const rows = await prisma.product.findMany({ where: { vendorId: s!.user.id }, orderBy: { createdAt: "desc" } });
  const cols: Column<Product>[] = [
    { header: "Product", cell: (p) => <div><p className="font-medium">{p.name}</p><p className="text-xs text-slate-400">{p.category}</p></div> },
    { header: "Price", cell: (p) => `${etb(p.price)} / ${p.unit}` }, { header: "Quantity", cell: (p) => `${p.stock.toLocaleString()} ${p.unit}` },
    { header: "Expires", cell: (p) => p.expiresAt?.toLocaleDateString("en-GB") ?? "—" }, { header: "Status", cell: (p) => <StatusBadge value={productStatus(p)} /> }];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">My Offers</h1><p className="text-sm text-slate-500">Manage and track all your product offers.</p></div>
        <Link href="/vendor/new-request" className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"><Plus className="h-4 w-4" />Create New Offer</Link></div>
      <div className="card"><DataTable columns={cols} rows={rows} /></div>
    </div>
  );
}
