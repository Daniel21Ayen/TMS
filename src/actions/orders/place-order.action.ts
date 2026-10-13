"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/services/notification/notify";

export async function placeOrder(productId: string, formData: FormData) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "CUSTOMER") throw new Error("Forbidden");
  const qty = Number(formData.get("quantity"));
  let err = "";
  try {
    if (!Number.isInteger(qty) || qty < 1) throw new Error("Enter a valid quantity");
    await prisma.$transaction(async (tx) => {
      const p = await tx.product.findUnique({ where: { id: productId }, include: { vendor: true } });
      if (!p || p.vendor.status !== "ACTIVE" || (p.expiresAt && p.expiresAt < new Date())) throw new Error("This offer is no longer available");
      const total = p.price * qty;
      if (!(await tx.product.updateMany({ where: { id: productId, stock: { gte: qty } }, data: { stock: { decrement: qty } } })).count) throw new Error("Not enough stock");
      if (!(await tx.wallet.updateMany({ where: { userId: s.user.id, balance: { gte: total } }, data: { balance: { decrement: total } } })).count) throw new Error("Insufficient wallet balance");
      const w = await tx.wallet.findUniqueOrThrow({ where: { userId: s.user.id } });
      await tx.transaction.create({ data: { type: "PAYMENT", amount: total, note: `Order: ${qty} × ${p.name}`, walletId: w.id } });
      await tx.vendorOrder.create({ data: { productId, vendorId: p.vendorId, customerId: s.user.id, quantity: qty, total } });
      await notify(tx, p.vendorId, "New order received", `${qty} × ${p.name} (ETB ${total.toLocaleString()})`);
    });
  } catch (e) { err = e instanceof Error ? e.message : "Order failed"; }
  revalidatePath("/customer/marketplace");
  redirect(`/customer/marketplace?${err ? `error=${encodeURIComponent(err)}` : "ok=1"}`);
}
