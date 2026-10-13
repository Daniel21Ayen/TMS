import { Save, TriangleAlert } from "lucide-react";
import type { Product } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { etb, productStatus } from "@/lib/utils";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { setStock } from "@/actions/vendor/update-inventory.action";
export const dynamic = "force-dynamic";
export default async function Inventory() {
  const s = await getServerSession(authOptions);
  const rows = await prisma.product.findMany({ where: { vendorId: s!.user.id }, orderBy: { stock: "asc" } });
  const low = rows.filter((p) => p.stock < 10).length;
  const cols: Column<Product>[] = [
    { header: "Product", cell: (p) => <div><p className="font-medium">{p.name}</p><p className="text-xs text-slate-400">{p.category}</p></div> },
    { header: "Price", cell: (p) => `${etb(p.price)} / ${p.unit}` },
    { header: "Stock", cell: (p) => <form action={setStock.bind(null, p.id)} className="flex items-center gap-2"><input name="stock" type="number" min={0} defaultValue={p.stock} className={`w-24 rounded-lg border px-2 py-1.5 text-sm ${p.stock < 10 ? "border-amber-300 bg-amber-50" : "border-slate-200"}`} />
      <button title="Save stock" className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"><Save className="h-4 w-4" /></button></form> },
    { header: "Status", cell: (p) => <StatusBadge value={productStatus(p)} /> }];
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Inventory</h1><p className="text-sm text-slate-500">Manage your stock and keep track of available products.</p></div>
      {low > 0 && <p className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700"><TriangleAlert className="h-4 w-4" />{low} product{low > 1 && "s"} running low (under 10 units).</p>}
      <div className="card"><DataTable columns={cols} rows={rows} /></div>
    </div>
  );
}
