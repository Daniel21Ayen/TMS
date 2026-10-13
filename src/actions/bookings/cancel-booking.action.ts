"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/services/notification/notify";

export async function cancelBooking(id: string) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "CUSTOMER") throw new Error("Forbidden");
  await prisma.$transaction(async (tx) => {
    const b = await tx.booking.findFirst({ where: { id, customerId: s.user.id, status: "CONFIRMED" }, include: { trip: true } });
    if (!b || b.trip.status !== "UPCOMING") return; // can't cancel once the trip has started
    if (!(await tx.booking.updateMany({ where: { id, status: "CONFIRMED" }, data: { status: "CANCELLED" } })).count) return;
    await tx.trip.update({ where: { id: b.tripId }, data: { seatsLeft: { increment: b.seats } } });
    const w = await tx.wallet.update({ where: { userId: s.user.id }, data: { balance: { increment: b.amount } } });
    await tx.transaction.create({ data: { type: "REFUND", amount: b.amount, note: `Booking cancelled: ${b.trip.origin} → ${b.trip.destination}`, walletId: w.id } });
    await notify(tx, b.trip.driverId, "Booking cancelled", `A passenger cancelled ${b.seats} seat${b.seats > 1 ? "s" : ""} on ${b.trip.origin} → ${b.trip.destination}.`);
  });
  revalidatePath("/customer/bookings"); revalidatePath("/driver/trips");
}
