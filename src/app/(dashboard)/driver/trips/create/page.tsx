import Link from "next/link";
import { ArrowLeft, AlertCircle, MapPin, Flag, CalendarClock, Armchair, Banknote } from "lucide-react";
import { createScheduledTrip } from "@/actions/trips/schedule-trip.action";
import { CITIES } from "@/data/constants/cities";
const input = "w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
const F = ({ label, icon: I, ...p }: { label: string; icon: typeof MapPin } & React.InputHTMLAttributes<HTMLInputElement>) => <label className="block text-sm font-semibold">{label}<div className="relative mt-1.5"><I className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input required className={input} {...p} /></div></label>;
export default function CreateTrip({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/driver/trips" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" />Back to trips</Link>
      <form action={createScheduledTrip} className="card space-y-5 p-8">
        <div><h1 className="text-2xl font-bold">Schedule a Trip</h1><p className="text-sm text-slate-500">Offer seats on a route. Passengers pay from their wallet when they book.</p></div>
        {searchParams.error && <p className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{searchParams.error}</p>}
        <div className="grid gap-4 sm:grid-cols-2"><F label="From" icon={MapPin} name="origin" list="cities" placeholder="Addis Ababa" /><F label="To" icon={Flag} name="destination" list="cities" placeholder="Bahir Dar" /></div>
        <datalist id="cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
        <F label="Departure" icon={CalendarClock} name="departAt" type="datetime-local" />
        <div className="grid gap-4 sm:grid-cols-2"><F label="Seats available" icon={Armchair} name="seats" type="number" min={1} max={60} defaultValue={4} /><F label="Price per seat (ETB)" icon={Banknote} name="price" type="number" min={10} placeholder="800" /></div>
        <button className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700">Publish Trip</button>
      </form>
    </div>
  );
}
