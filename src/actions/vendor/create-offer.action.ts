"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

async function vendor() {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "VENDOR") throw new Error("Forbidden");
  return s.user;
}
export async function createOffer(formData: FormData) {
  const u = await vendor();
  const back = (m: string) => redirect(`/vendor/new-request?error=${encodeURIComponent(m)}`);
  const me = await prisma.user.findUnique({ where: { id: u.id } });
  if (me?.status !== "ACTIVE") return back("Your account is awaiting admin verification");
  const p = productSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return back(p.error.issues[0].message);
  await prisma.product.create({ data: { ...p.data, description: p.data.description || null, vendorId: u.id } });
  revalidatePath("/vendor", "layout");
  redirect("/vendor/my-offers");
}
export async function setStock(id: string, formData: FormData) {
  const u = await vendor();
  const n = Number(formData.get("stock"));
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000) return;
  await prisma.product.updateMany({ where: { id, vendorId: u.id }, data: { stock: n } });
  revalidatePath("/vendor/inventory");
}
