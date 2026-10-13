"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validators";
import { notify } from "@/services/notification/notify";

const COMMISSION = 0.1;
async function driver() { const s = await getServerSession(authOptions); if (s?.user.role !== "DRIVER") throw new Error("Forbidden"); return s.user; }
const refresh = () => { revalidatePath("/driver/trips"); revalidatePath("/customer/bookings"); };

export async function createScheduledTrip(formData: FormData) {
  const u = await driver();
  const back = (m: string) => redirect(`/driver/trips/create?error=${encodeURIComponent(m)}`);
  const [me, vehicle] = await Promise.all([prisma.user.findUnique({ where: { id: u.id } }), prisma.vehicle.findFirst({ where: { ownerId: u.id, status: "ACTIVE" } })]);
  if (me?.status !== "ACTIVE") return back("Your account is awaiting admin verification");
  if (!vehicle) return back("Register an active vehicle first");
  const p = tripSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return back(p.error.issues[0].message);
  await prisma.trip.create({ data: { origin: p.data.origin, destination: p.data.destination, departAt: p.data.departAt, price: p.data.price, seats: p.data.seats, seatsLeft: p.data.seats, driverId: u.id, vehicleId: vehicle.id } });
  refresh();
  redirect("/driver/trips");
}

export async function startScheduledTrip(id: string) {
  const u = await driver();
  await prisma.$transaction(async (tx) => {
    const t = await tx.trip.findFirst({ where: { id, driverId: u.id, status: "UPCOMING" } });
    if (!t || !(await tx.trip.updateMany({ where: { id, status: "UPCOMING" }, data: { status: "ONGOING" } })).count) return;
    for (const b of await tx.booking.findMany({ where: { tripId: id, status: "CONFIRMED" } })) await notify(tx, b.customerId, "Trip started", `Your trip ${t.origin} → ${t.destination} has started.`);
  });
  refresh();
}

export async function completeScheduledTrip(id: string) {
  const u = await driver();
  await prisma.$transaction(async (tx) => {
    const t = await tx.trip.findFirst({ where: { id, driverId: u.id, status: "ONGOING" } });
    if (!t || !(await tx.trip.updateMany({ where: { id, status: "ONGOING" }, data: { status: "COMPLETED" } })).count) return; // status flip first: no double payout
    const bks = await tx.booking.findMany({ where: { tripId: id, status: "CONFIRMED" } });
    await tx.booking.updateMany({ where: { tripId: id, status: "CONFIRMED" }, data: { status: "COMPLETED" } });
    const total = bks.reduce((a, b) => a + b.amount, 0);
    if (total > 0) { // passengers paid at booking; driver gets total minus 10% commission
      const fee = Math.round(total * COMMISSION), net = total - fee;
      const w = await tx.wallet.upsert({ where: { userId: u.id }, update: { balance: { increment: net } }, create: { userId: u.id, balance: net } });
      await tx.transaction.create({ data: { type: "EARNING", amount: net, note: `Trip ${t.origin} → ${t.destination} (10% commission deducted)`, walletId: w.id } });
      await tx.commission.create({ data: { tripId: id, amount: fee } });
    }
    for (const b of bks) await notify(tx, b.customerId, "Trip completed", `Your trip ${t.origin} → ${t.destination} is complete. Please rate your driver.`);
  });
  refresh();
}

export async function cancelScheduledTrip(id: string) {
  const u = await driver();
  await prisma.$transaction(async (tx) => {
    const t = await tx.trip.findFirst({ where: { id, driverId: u.id, status: "UPCOMING" } });
    if (!t || !(await tx.trip.updateMany({ where: { id, status: "UPCOMING" }, data: { status: "CANCELLED" } })).count) return;
    for (const b of await tx.booking.findMany({ where: { tripId: id, status: "CONFIRMED" } })) { // refund every passenger
      await tx.booking.update({ where: { id: b.id }, data: { status: "CANCELLED" } });
      const w = await tx.wallet.update({ where: { userId: b.customerId }, data: { balance: { increment: b.amount } } });
      await tx.transaction.create({ data: { type: "REFUND", amount: b.amount, note: `Trip cancelled: ${t.origin} → ${t.destination}`, walletId: w.id } });
      await notify(tx, b.customerId, "Trip cancelled", `The driver cancelled ${t.origin} → ${t.destination}. ETB ${b.amount.toLocaleString()} was refunded.`);
    }
  });
  refresh();
}
