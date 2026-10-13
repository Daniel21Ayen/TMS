"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { passwordChangeSchema, profileSchema } from "@/lib/validators";
import { settingsPath } from "@/lib/utils";
import { audit } from "@/lib/audit";

async function me() { const s = await getServerSession(authOptions); if (!s) throw new Error("Unauthorized"); return s.user; }

export async function updateProfile(formData: FormData) {
  const u = await me();
  const p = profileSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${settingsPath(u.role)}?error=${encodeURIComponent(p.error.issues[0].message)}`);
  await prisma.user.update({ where: { id: u.id }, data: { name: p.data.name, phone: p.data.phone || null } });
  revalidatePath("/", "layout");
  redirect(`${settingsPath(u.role)}?ok=profile`);
}

export async function changePassword(formData: FormData) {
  const u = await me();
  const back = (m: string) => redirect(`${settingsPath(u.role)}?error=${encodeURIComponent(m)}`);
  const p = passwordChangeSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return back(p.error.issues[0].message);
  const user = await prisma.user.findUnique({ where: { id: u.id } });
  if (!user || !(await bcrypt.compare(p.data.current, user.passwordHash))) return back("Current password is incorrect");
  await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await bcrypt.hash(p.data.password, 10), tokenVersion: { increment: 1 } } }); // signs out all sessions
  await audit(u.id, "auth.password_changed");
  redirect("/login?reset=1");
}
