import Link from "next/link";
import { ArrowLeft, AlertCircle, Package, MapPin, Flag, Weight, Banknote } from "lucide-react";
import { createShipment } from "@/actions/shipments/create-shipment.action";
const CITIES = ["Addis Ababa", "Dire Dawa", "Bahir Dar", "Hawassa", "Mekelle", "Adama", "Gondar", "Dessie", "Jimma", "Harar"];
const input = "w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const Field = ({ label, icon: I, ...p }: { label: string; icon: typeof Package } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block text-sm font-semibold">{label}<div className="relative mt-1.5"><I className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input required className={input} {...p} /></div></label>);
export default function CreateShipment({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/customer/shipments" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" />Back to shipments</Link>
      <form action={createShipment} className="card space-y-5 p-8">
        <div><h1 className="text-2xl font-bold">Post a Shipment</h1><p className="text-sm text-slate-500">Drivers nearby will see it and can accept your offer.</p></div>
        {searchParams.error && <p className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{searchParams.error}</p>}
        <Field label="Item" icon={Package} name="item" placeholder="e.g. Electronics Box" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pickup" icon={MapPin} name="origin" list="cities" placeholder="Addis Ababa" /><Field label="Destination" icon={Flag} name="destination" list="cities" placeholder="Dire Dawa" /></div>
        <datalist id="cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Weight (kg)" icon={Weight} name="weightKg" type="number" min={1} placeholder="500" /><Field label="Your offer (ETB)" icon={Banknote} name="price" type="number" min={100} placeholder="6500" /></div>
        <button className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">Post Shipment</button>
      </form>
    </div>
  );
}
