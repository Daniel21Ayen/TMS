"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetSchema } from "@/lib/validators";
import { issueOtp, verifyOtp } from "@/services/auth/otp.service";
import { guard, clientIp } from "@/lib/rate-limit";

export async function requestReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const lim = await guard(`reset:${clientIp()}`, 10, 3600);
  if (lim) redirect(`/forgot-password?error=${encodeURIComponent(lim)}`);
  if (email && (await prisma.user.findUnique({ where: { email } }))) await issueOtp(email, "RESET");
  redirect(`/forgot-password?step=reset&email=${encodeURIComponent(email)}`); // same response whether or not the account exists
}

export async function resetPassword(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const back = (m: string) => redirect(`/forgot-password?step=reset&email=${encodeURIComponent(String(raw.email ?? ""))}&error=${encodeURIComponent(m)}`);
  const p = resetSchema.safeParse(raw);
  if (!p.success) return back(p.error.issues[0].message);
  const lim = await guard(`otp:${p.data.email}`, 10, 3600);
  if (lim) return back(lim);
  if (!(await verifyOtp(p.data.email, "RESET", p.data.code))) return back("Invalid or expired code");
  await prisma.user.update({ where: { email: p.data.email }, data: { passwordHash: await bcrypt.hash(p.data.password, 10), tokenVersion: { increment: 1 } } }); // signs out all sessions
  redirect("/login?reset=1");
}
