import Link from "next/link";
import { ArrowLeft, AlertCircle, Hash, Truck, Weight } from "lucide-react";
import { registerVehicle } from "@/actions/driver/register-vehicle.action";
import { VEHICLE_TYPES } from "@/data/constants/vehicleTypes";
const input = "w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
export default function RegisterVehicle({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/driver/my-vehicles" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" />Back to vehicles</Link>
      <form action={registerVehicle} className="card space-y-5 p-8">
        <div><h1 className="text-2xl font-bold">Register Vehicle</h1><p className="text-sm text-slate-500">Add a vehicle to start accepting trips and loads.</p></div>
        {searchParams.error && <p className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{searchParams.error}</p>}
        <label className="block text-sm font-semibold">Plate Number<div className="relative mt-1.5"><Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input name="plate" required placeholder="e.g. AA-12345" className={input} /></div></label>
        <label className="block text-sm font-semibold">Vehicle Type<div className="relative mt-1.5"><Truck className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><select name="type" className={input}>{VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div></label>
        <label className="block text-sm font-semibold">Capacity<div className="relative mt-1.5"><Weight className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input name="capacity" placeholder="e.g. 5 Ton or 12 Seater" className={input} /></div></label>
        <button className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">Register Vehicle</button>
      </form>
    </div>
  );
}
