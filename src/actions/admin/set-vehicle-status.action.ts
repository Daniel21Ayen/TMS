"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleMaintenance(id: string) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "ADMIN") throw new Error("Forbidden");
  const v = await prisma.vehicle.findUnique({ where: { id } });
  if (!v || v.status === "INACTIVE") return;
  await prisma.vehicle.update({ where: { id }, data: { status: v.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE" } });
  revalidatePath("/admin/fleet-management");
}
