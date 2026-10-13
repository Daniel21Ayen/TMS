"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/services/notification/notify";

export async function bookTrip(tripId: string, formData: FormData) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "CUSTOMER") throw new Error("Forbidden");
  const seats = Number(formData.get("seats"));
  let err = "";
  try {
    if (!Number.isInteger(seats) || seats < 1 || seats > 10) throw new Error("Choose between 1 and 10 seats");
    await prisma.$transaction(async (tx) => {
      const t = await tx.trip.findUnique({ where: { id: tripId }, include: { driver: true } });
      if (!t || t.status !== "UPCOMING" || t.departAt <= new Date() || t.driver.status !== "ACTIVE") throw new Error("This trip is no longer available");
      const amount = t.price * seats;
      if (!(await tx.trip.updateMany({ where: { id: tripId, seatsLeft: { gte: seats } }, data: { seatsLeft: { decrement: seats } } })).count) throw new Error("Not enough seats left");
      if (!(await tx.wallet.updateMany({ where: { userId: s.user.id, balance: { gte: amount } }, data: { balance: { decrement: amount } } })).count) throw new Error("Insufficient wallet balance");
      const w = await tx.wallet.findUniqueOrThrow({ where: { userId: s.user.id } });
      await tx.transaction.create({ data: { type: "PAYMENT", amount, note: `Trip ${t.origin} → ${t.destination} (${seats} seat${seats > 1 ? "s" : ""})`, walletId: w.id } });
      await tx.booking.create({ data: { status: "CONFIRMED", amount, seats, customerId: s.user.id, tripId } });
      await notify(tx, t.driverId, "New booking", `${seats} seat${seats > 1 ? "s" : ""} booked on ${t.origin} → ${t.destination}.`);
    });
  } catch (e) { err = e instanceof Error ? e.message : "Booking failed"; }
  revalidatePath("/customer/find-transport/passengers");
  redirect(err ? `/customer/find-transport/passengers?error=${encodeURIComponent(err)}` : "/customer/bookings?ok=1");
}
