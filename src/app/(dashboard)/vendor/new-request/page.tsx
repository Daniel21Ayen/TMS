import { PackagePlus, AlertCircle, Tag, Boxes, Banknote, CalendarClock, Ruler } from "lucide-react";
import { createOffer } from "@/actions/vendor/create-offer.action";
import { CATEGORIES } from "@/data/constants/categories";
const input = "w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const F = ({ label, icon: I, ...p }: { label: string; icon: typeof Tag } & React.InputHTMLAttributes<HTMLInputElement>) => <label className="block text-sm font-semibold">{label}<div className="relative mt-1.5"><I className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className={input} {...p} /></div></label>;
export default function NewRequest({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-2xl">
      <form action={createOffer} className="card space-y-5 p-8">
        <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><PackagePlus className="h-6 w-6" /></span><div><h1 className="text-2xl font-bold">Post a New Request</h1><p className="text-sm text-slate-500">Let customers know what you can supply.</p></div></div>
        {searchParams.error && <p className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{searchParams.error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Category<select name="category" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <F label="Product name" icon={Tag} name="name" required placeholder="e.g. Fresh Tomatoes" /></div>
        <label className="block text-sm font-semibold">Description<textarea name="description" rows={3} maxLength={500} placeholder="Describe the product..." className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-brand-500" /></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <F label="Quantity" icon={Boxes} name="stock" type="number" min={0} required placeholder="500" /><F label="Unit" icon={Ruler} name="unit" required defaultValue="kg" /><F label="Price per unit (ETB)" icon={Banknote} name="price" type="number" min={1} required placeholder="25" /></div>
        <F label="Expiry date (optional)" icon={CalendarClock} name="expiresAt" type="date" />
        <button className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">Post Request</button>
      </form>
    </div>
  );
}
