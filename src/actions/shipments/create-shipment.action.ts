"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shipmentSchema } from "@/lib/validators";

async function customer() {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "CUSTOMER") throw new Error("Forbidden");
  return s.user;
}

export async function createShipment(formData: FormData) {
  const u = await customer();
  const back = (m: string) => redirect(`/customer/shipments/create?error=${encodeURIComponent(m)}`);
  const p = shipmentSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return back(p.error.issues[0].message);
  const w = await prisma.wallet.findUnique({ where: { userId: u.id } });
  if (!w || Number(w.balance) < p.data.price) return back("Insufficient wallet balance for this offer");
  await prisma.load.create({ data: { ...p.data, postedById: u.id } });
  revalidatePath("/customer/shipments");
  redirect("/customer/shipments");
}

export async function cancelShipment(id: string) {
  const u = await customer();
  await prisma.load.deleteMany({ where: { id, postedById: u.id, status: "AVAILABLE" } }); // only before a driver accepts
  revalidatePath("/customer/shipments");
}
