"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentRequestSchema } from "@/lib/validators";

// Manual payment proof (per SRS): user pays externally, submits the receipt, admin verifies and credits.
export async function requestTopUp(formData: FormData) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "CUSTOMER") throw new Error("Forbidden");
  const back = (m: string) => redirect(`/customer/wallet?error=${encodeURIComponent(m)}`);
  const p = paymentRequestSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return back(p.error.issues[0].message);
  const dup = await prisma.paymentRequest.findFirst({ where: { kind: "TOPUP", method: p.data.method, reference: p.data.reference, status: { in: ["PENDING", "APPROVED"] } } });
  if (dup) return back("This payment reference was already submitted");
  await prisma.paymentRequest.create({ data: { ...p.data, kind: "TOPUP", userId: s.user.id } });
  revalidatePath("/customer/wallet");
  redirect("/customer/wallet?ok=1");
}
