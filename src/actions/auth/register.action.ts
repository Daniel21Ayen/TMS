"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { guard, clientIp } from "@/lib/rate-limit";
import { issueOtp } from "@/services/auth/otp.service";

export async function register(formData: FormData) {
  const back = (m: string) => redirect(`/register?error=${encodeURIComponent(m)}`);
  const lim = await guard(`register:${clientIp()}`, 5, 3600);
  if (lim) return back(lim);
  const p = registerSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return back(p.error.issues[0].message);
  const { name, email, phone, role, password } = p.data;
  let err = "";
  try {
    await prisma.user.create({ data: { name, email, role, phone: phone || null, passwordHash: await bcrypt.hash(password, 10), status: "PENDING", emailVerified: false, wallet: { create: {} } } });
  } catch (e) { err = (e as { code?: string }).code === "P2002" ? "An account with this email already exists" : "Could not create the account"; }
  if (err) return back(err);
  await issueOtp(email, "VERIFY");
  redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
}
