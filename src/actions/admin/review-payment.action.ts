"use server";
import { notify } from "@/services/notification/notify";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function reviewRequest(id: string, approve: boolean) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "ADMIN") throw new Error("Forbidden");
  await prisma.$transaction(async (tx) => {
    const r = await tx.paymentRequest.findUnique({ where: { id } });
    if (!r) return;
    const flip = await tx.paymentRequest.updateMany({ where: { id, status: "PENDING" }, data: { status: approve ? "APPROVED" : "REJECTED", reviewedAt: new Date() } });
    if (!flip.count) return; // already reviewed
    await tx.auditLog.create({ data: { actorId: s.user.id, action: approve ? "payment.approve" : "payment.reject", target: id, meta: `${r.kind} ETB ${r.amount}` } });
    await notify(tx, r.userId, approve ? "Request approved" : "Request rejected", `Your ${r.kind === "TOPUP" ? "top-up" : "withdrawal"} of ETB ${r.amount.toLocaleString()} was ${approve ? "approved" : "rejected"}.`);
    const w = await tx.wallet.upsert({ where: { userId: r.userId }, update: {}, create: { userId: r.userId } });
    if (r.kind === "TOPUP" && approve) {
      await tx.wallet.update({ where: { id: w.id }, data: { balance: { increment: r.amount } } });
      await tx.transaction.create({ data: { type: "DEPOSIT", amount: r.amount, note: `Top-up via ${r.method} (${r.reference})`, walletId: w.id } });
    }
    if (r.kind === "WITHDRAWAL" && !approve) {
      await tx.wallet.update({ where: { id: w.id }, data: { balance: { increment: r.amount } } });
      await tx.transaction.create({ data: { type: "REFUND", amount: r.amount, note: "Withdrawal rejected – funds returned", walletId: w.id } });
    }
  });
  revalidatePath("/admin/payments-wallet");
}
