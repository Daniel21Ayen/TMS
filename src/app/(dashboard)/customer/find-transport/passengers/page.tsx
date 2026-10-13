import { Search, MapPin, Flag, CalendarClock, Armchair, ArrowRight, AlertCircle, SearchX, Ticket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { etb } from "@/lib/utils";
import { CITIES } from "@/data/constants/cities";
import { bookTrip } from "@/actions/bookings/create-booking.action";
export const dynamic = "force-dynamic";
const input = "w-full rounded-xl bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/30";
export default async function FindPassengers({ searchParams: sp }: { searchParams: { from?: string; to?: string; error?: string } }) {
  const trips = await prisma.trip.findMany({
    where: { status: "UPCOMING", departAt: { gt: new Date() }, seatsLeft: { gt: 0 }, driver: { status: "ACTIVE" },
      ...(sp.from && { origin: { contains: sp.from, mode: "insensitive" } }), ...(sp.to && { destination: { contains: sp.to, mode: "insensitive" } }) },
    include: { driver: true, vehicle: true }, orderBy: { departAt: "asc" }, take: 20 });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Find Transport</h1><p className="text-sm text-slate-500">Search available rides and book your seat. Need to send goods instead? <a href="/customer/shipments/create" className="font-medium text-brand-600">Post a shipment</a>.</p></div>
      <form className="card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto]">
        <label className="relative"><MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input name="from" list="cities" defaultValue={sp.from} placeholder="From" className={input} /></label>
        <label className="relative"><Flag className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input name="to" list="cities" defaultValue={sp.to} placeholder="To" className={input} /></label>
        <datalist id="cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"><Search className="h-4 w-4" />Search</button>
      </form>
      {sp.error && <p className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600"><AlertCircle className="h-4 w-4" />{sp.error}</p>}
      {!trips.length && <div className="card grid place-items-center gap-2 py-16 text-slate-400"><SearchX className="h-10 w-10" /><p className="text-sm">No upcoming trips match your search.</p></div>}
      <div className="grid gap-4 lg:grid-cols-2">{trips.map((t) => (
        <div key={t.id} className="card space-y-4 p-5">
          <div className="flex items-start justify-between"><div><p className="flex items-center gap-1.5 text-lg font-bold">{t.origin}<ArrowRight className="h-4 w-4 text-slate-400" />{t.destination}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><CalendarClock className="h-4 w-4" />{t.departAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p></div>
            <p className="text-right"><b className="text-xl text-brand-600">{etb(t.price)}</b><span className="block text-xs text-slate-400">per seat</span></p></div>
          <p className="flex items-center justify-between text-xs text-slate-500"><span>{t.driver.name}{t.vehicle && ` · ${t.vehicle.type.toLowerCase()} ${t.vehicle.plate}`}</span><span className="flex items-center gap-1"><Armchair className="h-3.5 w-3.5" />{t.seatsLeft} left</span></p>
          <form action={bookTrip.bind(null, t.id)} className="flex gap-2"><input name="seats" type="number" min={1} max={Math.min(10, t.seatsLeft)} defaultValue={1} className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700"><Ticket className="h-4 w-4" />Book Now</button></form>
        </div>))}</div>
    </div>
  );
}
