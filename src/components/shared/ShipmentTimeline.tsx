import { PackagePlus, UserCheck, Truck, PackageCheck, Check } from "lucide-react";
const steps = [{ l: "Posted", i: PackagePlus }, { l: "Accepted", i: UserCheck }, { l: "In Transit", i: Truck }, { l: "Delivered", i: PackageCheck }];
const idx: Record<string, number> = { AVAILABLE: 0, RESERVED: 1, IN_TRANSIT: 2, DELIVERED: 3 };
export default function ShipmentTimeline({ status }: { status: string }) {
  const cur = idx[status] ?? 0;
  return (
    <ol className="flex items-center">{steps.map(({ l, i: I }, n) => (
      <li key={l} className="flex flex-1 items-center last:flex-none">
        <div className="flex flex-col items-center gap-1">
          <span className={`grid h-9 w-9 place-items-center rounded-full ${n < cur || cur === 3 ? "bg-emerald-500 text-white" : n === cur ? "bg-brand-600 text-white ring-4 ring-brand-100" : "bg-slate-100 text-slate-400"}`}>{n < cur || cur === 3 ? <Check className="h-4 w-4" /> : <I className="h-4 w-4" />}</span>
          <span className="text-[11px] text-slate-500">{l}</span></div>
        {n < steps.length - 1 && <span className={`mx-1 mb-5 h-0.5 flex-1 ${n < cur ? "bg-emerald-500" : "bg-slate-100"}`} />}
      </li>))}</ol>
  );
}
