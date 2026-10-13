"use server";
import { notify } from "@/services/notification/notify";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function acceptLoad(id: string) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "DRIVER") throw new Error("Forbidden");
  const me = await prisma.user.findUnique({ where: { id: s.user.id }, include: { vehicles: { where: { status: "ACTIVE" }, take: 1 } } });
  if (me?.status !== "ACTIVE" || !me.vehicles.length) return; // verified driver with an active vehicle only (business rule)
  // atomic: only one driver can win an AVAILABLE load
  const r = await prisma.load.updateMany({ where: { id, status: "AVAILABLE" }, data: { status: "RESERVED", driverId: me.id } });
  const l = r.count ? await prisma.load.findUnique({ where: { id } }) : null;
  if (l) await notify(prisma, l.postedById, "Driver assigned", `${me.name} accepted your shipment "${l.item}".`);
  revalidatePath("/driver/available-loads");
}
