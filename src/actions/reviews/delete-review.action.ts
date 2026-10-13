"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
export async function deleteReview(id: string) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "ADMIN") throw new Error("Forbidden");
  await prisma.review.deleteMany({ where: { id } });
  await audit(s.user.id, "review.delete", id);
  revalidatePath("/admin/reviews-ratings");
}
