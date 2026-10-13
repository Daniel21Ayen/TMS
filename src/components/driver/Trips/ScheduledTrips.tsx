import { CalendarClock, Users, Play, CheckCircle2, Ban, ArrowRight, Bus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { etb } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import { startScheduledTrip, completeScheduledTrip, cancelScheduledTrip } from "@/actions/trips/schedule-trip.action";
export default async function ScheduledTrips({ driverId }: { driverId: string }) {
  const trips = await prisma.trip.findMany({ where: { driverId }, orderBy: { departAt: "desc" }, take: 10 });
  const b = "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium";
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-bold"><Bus className="h-5 w-5 text-brand-600" />Scheduled Passenger Trips</h2>
      {!trips.length && <p className="card py-10 text-center text-sm text-slate-400">No scheduled trips yet. Use “Schedule Trip” to offer seats.</p>}
      {trips.map((t) => (
        <div key={t.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <div><p className="flex items-center gap-1.5 font-semibold">{t.origin}<ArrowRight className="h-3.5 w-3.5 text-slate-400" />{t.destination}</p>
            <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-400"><span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />{t.departAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{t.seats - t.seatsLeft}/{t.seats} booked</span></p></div>
          <div className="flex items-center gap-3"><b className="text-brand-600">{etb(t.price)}/seat</b><StatusBadge value={t.status} />
            {t.status === "UPCOMING" && <><form action={startScheduledTrip.bind(null, t.id)}><button className={`${b} bg-brand-600 text-white hover:bg-brand-700`}><Play className="h-3.5 w-3.5" />Start</button></form>
              <form action={cancelScheduledTrip.bind(null, t.id)}><button className={`${b} bg-rose-50 text-rose-600 hover:bg-rose-100`}><Ban className="h-3.5 w-3.5" />Cancel</button></form></>}
            {t.status === "ONGOING" && <form action={completeScheduledTrip.bind(null, t.id)}><button className={`${b} bg-emerald-600 text-white hover:bg-emerald-700`}><CheckCircle2 className="h-3.5 w-3.5" />Complete</button></form>}</div>
        </div>))}
    </div>
  );
}
