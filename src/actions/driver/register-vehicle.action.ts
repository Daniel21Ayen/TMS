"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vehicleSchema } from "@/lib/validators";

export async function registerVehicle(formData: FormData) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "DRIVER") throw new Error("Forbidden");
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));
  const back = (m: string) => redirect(`/driver/my-vehicles/register?error=${encodeURIComponent(m)}`);
  if (!parsed.success) return back(parsed.error.issues[0].message);
  if (await prisma.vehicle.findUnique({ where: { plate: parsed.data.plate } })) return back("This plate number is already registered");
  await prisma.vehicle.create({ data: { ...parsed.data, ownerId: s.user.id } });
  revalidatePath("/driver/my-vehicles");
  redirect("/driver/my-vehicles");
}
