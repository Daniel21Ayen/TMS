"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/services/notification/notify";

export async function submitReview(kind: "load" | "order", id: string, formData: FormData) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "CUSTOMER") throw new Error("Forbidden");
  const rating = Number(formData.get("rating")), comment = String(formData.get("comment") ?? "").trim().slice(0, 500) || null;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
  let targetId: string, ref: { loadId?: string; orderId?: string };
  if (kind === "load") { // only for your own, delivered shipments
    const l = await prisma.load.findFirst({ where: { id, postedById: s.user.id, status: "DELIVERED", driverId: { not: null } } });
    if (!l?.driverId) return; targetId = l.driverId; ref = { loadId: id };
  } else {
    const o = await prisma.vendorOrder.findFirst({ where: { id, customerId: s.user.id, status: "DELIVERED" } });
    if (!o) return; targetId = o.vendorId; ref = { orderId: id };
  }
  try {
    await prisma.review.create({ data: { rating, comment, authorId: s.user.id, targetId, ...ref } });
    await notify(prisma, targetId, "New review", `You received a ${rating}-star rating.`);
  } catch (e) { if ((e as { code?: string }).code !== "P2002") throw e; } // already reviewed
  revalidatePath("/customer/reviews");
}
