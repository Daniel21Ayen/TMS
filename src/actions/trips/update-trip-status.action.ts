"use server";
import { notify } from "@/services/notification/notify";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const COMMISSION = 0.1; // business rule: commission on every completed trip
async function driver() {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "DRIVER") throw new Error("Forbidden");
  return s.user;
}

export async function startTrip(id: string) {
  const u = await driver();
  const r = await prisma.load.updateMany({ where: { id, driverId: u.id, status: "RESERVED" }, data: { status: "IN_TRANSIT" } });
  const l = r.count ? await prisma.load.findUnique({ where: { id } }) : null;
  if (l) await notify(prisma, l.postedById, "Shipment on the way", `"${l.item}" is now in transit to ${l.destination}.`);
  revalidatePath("/driver/trips");
}

export async function completeTrip(id: string) {
  const u = await driver();
  const load = await prisma.load.findFirst({ where: { id, driverId: u.id, status: "IN_TRANSIT" } });
  if (!load) return;
  try {
    await prisma.$transaction(async (tx) => {
      // flip status first so a double-click can never pay twice
      const flip = await tx.load.updateMany({ where: { id, status: "IN_TRANSIT" }, data: { status: "DELIVERED" } });
      if (!flip.count) throw new Error("DONE");
      const paid = await tx.wallet.updateMany({ where: { userId: load.postedById, balance: { gte: load.price } }, data: { balance: { decrement: load.price } } });
      if (!paid.count) throw new Error("The customer's wallet balance is insufficient");
      const cw = await tx.wallet.findUniqueOrThrow({ where: { userId: load.postedById } });
      const net = load.price - Math.round(load.price * COMMISSION);
      await tx.transaction.create({ data: { type: "PAYMENT", amount: load.price, note: `Delivery: ${load.item}`, walletId: cw.id } });
      await tx.commission.create({ data: { loadId: load.id, amount: load.price - net } });
      const dw = await tx.wallet.upsert({ where: { userId: u.id }, update: { balance: { increment: net } }, create: { userId: u.id, balance: net } });
      await tx.transaction.create({ data: { type: "EARNING", amount: net, note: `${load.item} (10% commission deducted)`, walletId: dw.id } });
      await notify(tx, load.postedById, "Shipment delivered", `"${load.item}" was delivered. ETB ${load.price.toLocaleString()} was charged to your wallet.`);
      await notify(tx, u.id, "Payment received", `ETB ${net.toLocaleString()} was added to your wallet for "${load.item}".`);
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : "Failed";
    if (m !== "DONE") redirect(`/driver/trips?error=${encodeURIComponent(m)}`);
  }
  revalidatePath("/driver/trips");
}
