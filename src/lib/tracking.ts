import { prisma } from "@/lib/prisma";
// Who may track what: a shipment's owner/driver/admin, or a passenger on their own booked trip.
export async function resolveTracking(id: string, user: { id: string; role: string }) {
  const load = await prisma.load.findUnique({ where: { id } });
  if (load && (load.postedById === user.id || load.driverId === user.id || user.role === "ADMIN"))
    return { title: load.item, from: load.origin, to: load.destination, driverId: load.driverId, live: load.status === "IN_TRANSIT", finished: load.status === "DELIVERED", status: load.status };
  const b = await prisma.booking.findFirst({ where: { id, customerId: user.id }, include: { trip: true } });
  if (b) { const t = b.trip; return { title: `Trip ${t.origin} → ${t.destination}`, from: t.origin, to: t.destination, driverId: t.driverId, live: t.status === "ONGOING", finished: t.status === "COMPLETED" || t.status === "CANCELLED", status: t.status }; }
  return null;
}
