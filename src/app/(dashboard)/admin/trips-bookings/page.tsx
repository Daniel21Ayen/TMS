import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { etb } from "@/lib/utils";
import DataTable, { type Column } from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
export const dynamic = "force-dynamic";
type T = Prisma.TripGetPayload<{ include: { driver: true } }>;
type B = Prisma.BookingGetPayload<{ include: { customer: true; trip: true } }>;
const when = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
export default async function TripsBookings() {
  const [trips, bookings] = await Promise.all([
    prisma.trip.findMany({ include: { driver: true }, orderBy: { departAt: "desc" }, take: 20 }),
    prisma.booking.findMany({ include: { customer: true, trip: true }, orderBy: { createdAt: "desc" }, take: 20 })]);
  const tc: Column<T>[] = [
    { header: "Route", cell: (t) => <b>{t.origin} → {t.destination}</b> }, { header: "Driver", cell: (t) => t.driver.name }, { header: "Departure", cell: (t) => when(t.departAt) },
    { header: "Seats", cell: (t) => `${t.seats - t.seatsLeft}/${t.seats}` }, { header: "Price", cell: (t) => etb(t.price) }, { header: "Status", cell: (t) => <StatusBadge value={t.status} /> }];
  const bc: Column<B>[] = [
    { header: "Booking", cell: (b) => `#${b.id.slice(-6).toUpperCase()}` }, { header: "Customer", cell: (b) => b.customer.name }, { header: "Route", cell: (b) => `${b.trip.origin} → ${b.trip.destination}` },
    { header: "Seats", cell: (b) => b.seats }, { header: "Amount", cell: (b) => <b>{etb(b.amount)}</b> }, { header: "Status", cell: (b) => <StatusBadge value={b.status} /> }];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Trips & Bookings</h1><p className="text-sm text-slate-500">View and manage scheduled trips and passenger bookings.</p></div>
      <div className="card"><h2 className="border-b border-slate-100 p-4 font-semibold">Trips</h2><DataTable columns={tc} rows={trips} /></div>
      <div className="card"><h2 className="border-b border-slate-100 p-4 font-semibold">Bookings</h2><DataTable columns={bc} rows={bookings} /></div>
    </div>
  );
}
