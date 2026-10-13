"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import type { OrderStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/services/notification/notify";

const FLOW: Partial<Record<OrderStatus, OrderStatus[]>> = { PENDING: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["PROCESSING", "CANCELLED"], PROCESSING: ["DELIVERED"] };

export async function updateOrder(id: string, next: OrderStatus) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "VENDOR") throw new Error("Forbidden");
  const o = await prisma.vendorOrder.findFirst({ where: { id, vendorId: s.user.id }, include: { product: true } });
  if (!o || !(FLOW[o.status] ?? []).includes(next)) return;
  await prisma.$transaction(async (tx) => {
    const f = await tx.vendorOrder.updateMany({ where: { id, status: o.status }, data: { status: next } }); // guards double-clicks
    if (!f.count) return;
    if (next === "CANCELLED") { // restore stock and refund the customer
      await tx.product.update({ where: { id: o.productId }, data: { stock: { increment: o.quantity } } });
      const w = await tx.wallet.update({ where: { userId: o.customerId }, data: { balance: { increment: o.total } } });
      await tx.transaction.create({ data: { type: "REFUND", amount: o.total, note: `Order cancelled: ${o.product.name}`, walletId: w.id } });
    }
    if (next === "DELIVERED") { // pay the vendor minus 10% commission
      const fee = Math.round(o.total * 0.1), net = o.total - fee;
      const vw = await tx.wallet.upsert({ where: { userId: s.user.id }, update: { balance: { increment: net } }, create: { userId: s.user.id, balance: net } });
      await tx.transaction.create({ data: { type: "EARNING", amount: net, note: `${o.product.name} (10% commission deducted)`, walletId: vw.id } });
      await tx.commission.create({ data: { orderId: o.id, amount: fee } });
    }
    await notify(tx, o.customerId, "Order update", `Your order for ${o.product.name} is now ${next.toLowerCase()}.`);
  });
  revalidatePath("/vendor", "layout");
}
