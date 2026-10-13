"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function markAllRead() {
  const s = await getServerSession(authOptions);
  if (!s) throw new Error("Unauthorized");
  await prisma.notification.updateMany({ where: { userId: s.user.id, read: false }, data: { read: true } });
  revalidatePath("/", "layout"); // refresh the bell badge
}
