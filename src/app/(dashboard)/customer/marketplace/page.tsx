import { Store, AlertCircle, CheckCircle2, ShoppingCart, PackageSearch } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { etb } from "@/lib/utils";
import { placeOrder } from "@/actions/orders/place-order.action";
export const dynamic = "force-dynamic";
export default async function Marketplace({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const now = new Date();
  const products = await prisma.product.findMany({ where: { stock: { gt: 0 }, vendor: { status: "ACTIVE" }, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }, include: { vendor: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Marketplace</h1><p className="text-sm text-slate-500">Order goods from verified vendors. Payment is taken from your wallet.</p></div>
      {searchParams.error && <p className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{searchParams.error}</p>}
      {searchParams.ok && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />Order placed. The vendor has been notified.</p>}
      {!products.length && <div className="card grid place-items-center gap-2 py-16 text-slate-400"><PackageSearch className="h-10 w-10" /><p className="text-sm">No offers available right now.</p></div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{products.map((p) => (
        <div key={p.id} className="card space-y-3 p-5">
          <div className="flex items-start gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-50 text-orange-500"><Store className="h-6 w-6" /></span>
            <div className="flex-1"><p className="font-semibold">{p.name}</p><p className="text-xs text-slate-400">{p.category} · {p.vendor.name}</p></div></div>
          {p.description && <p className="text-sm text-slate-500">{p.description}</p>}
          <div className="flex justify-between text-sm"><b className="text-brand-600">{etb(p.price)} / {p.unit}</b><span className="text-slate-400">{p.stock.toLocaleString()} in stock</span></div>
          <form action={placeOrder.bind(null, p.id)} className="flex gap-2"><input name="quantity" type="number" min={1} max={p.stock} defaultValue={1} className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700"><ShoppingCart className="h-4 w-4" />Order</button></form>
        </div>))}</div>
    </div>
  );
}
