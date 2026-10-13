import Link from "next/link";
import { Navigation, CalendarCheck, ArrowRight, CalendarClock, Armchair, Ban, CheckCircle2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { etb } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import { cancelBooking } from "@/actions/bookings/cancel-booking.action";
export const dynamic = "force-dynamic";
export default async function Bookings({ searchParams }: { searchParams: { ok?: string } }) {
  const s = await getServerSession(authOptions);
  const rows = await prisma.booking.findMany({ where: { customerId: s!.user.id }, include: { trip: { include: { driver: true } } }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Bookings</h1><p className="text-sm text-slate-500">Manage your confirmed bookings and upcoming trips.</p></div>
      {searchParams.ok && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />Booking confirmed. Payment was taken from your wallet.</p>}
      {!rows.length && <div className="card grid place-items-center gap-2 py-16 text-slate-400"><CalendarCheck className="h-10 w-10" /><p className="text-sm">No bookings yet.</p></div>}
      {rows.map((b) => (
        <div key={b.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <div><p className="flex items-center gap-1.5 font-semibold">{b.trip.origin}<ArrowRight className="h-3.5 w-3.5 text-slate-400" />{b.trip.destination}</p>
            <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-400"><span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />{b.trip.departAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span><span className="flex items-center gap-1"><Armchair className="h-3.5 w-3.5" />{b.seats} seat{b.seats > 1 && "s"}</span><span>Driver: {b.trip.driver.name}</span></p></div>
          <div className="flex items-center gap-3"><b>{etb(b.amount)}</b><StatusBadge value={b.status} />
            {b.trip.status === "ONGOING" && b.status === "CONFIRMED" && <Link href={`/customer/tracking/${b.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-600 hover:bg-brand-100"><Navigation className="h-3.5 w-3.5" />Live map</Link>}
            {b.status === "CONFIRMED" && b.trip.status === "UPCOMING" && <form action={cancelBooking.bind(null, b.id)}><button className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-100"><Ban className="h-3.5 w-3.5" />Cancel & refund</button></form>}</div>
        </div>))}
    </div>
  );
}
