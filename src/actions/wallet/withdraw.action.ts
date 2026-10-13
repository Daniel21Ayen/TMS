"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentRequestSchema } from "@/lib/validators";

export async function requestWithdrawal(formData: FormData) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "DRIVER") throw new Error("Forbidden");
  const back = (m: string) => redirect(`/driver/earnings-wallet?error=${encodeURIComponent(m)}`);
  const p = paymentRequestSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return back(p.error.issues[0].message);
  let err = "";
  try {
    await prisma.$transaction(async (tx) => {
      // hold the funds immediately so the same balance can't be withdrawn twice
      const held = await tx.wallet.updateMany({ where: { userId: s.user.id, balance: { gte: p.data.amount } }, data: { balance: { decrement: p.data.amount } } });
      if (!held.count) throw new Error("Insufficient balance");
      const w = await tx.wallet.findUniqueOrThrow({ where: { userId: s.user.id } });
      await tx.transaction.create({ data: { type: "WITHDRAWAL", amount: p.data.amount, note: "Withdrawal request (held until reviewed)", walletId: w.id } });
      await tx.paymentRequest.create({ data: { ...p.data, kind: "WITHDRAWAL", userId: s.user.id } });
    });
  } catch (e) { err = e instanceof Error ? e.message : "Request failed"; }
  if (err) return back(err);
  revalidatePath("/driver/earnings-wallet");
  redirect("/driver/earnings-wallet?ok=1");
}
