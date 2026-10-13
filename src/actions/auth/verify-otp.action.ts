"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { issueOtp, verifyOtp } from "@/services/auth/otp.service";
import { guard, clientIp } from "@/lib/rate-limit";

export async function verifyEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase(), code = String(formData.get("code") ?? "").trim();
  const back = (m: string) => redirect(`/verify-otp?email=${encodeURIComponent(email)}&error=${encodeURIComponent(m)}`);
  if (!/^\d{6}$/.test(code)) return back("Enter the 6-digit code");
  const lim = await guard(`otp:${email}`, 10, 3600);
  if (lim) return back(lim);
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !(await verifyOtp(email, "VERIFY", code))) return back("Invalid or expired code");
  // customers are active right away; drivers & vendors still wait for admin verification
  await prisma.user.update({ where: { id: u.id }, data: { emailVerified: true, ...(u.role === "CUSTOMER" && u.status === "PENDING" ? { status: "ACTIVE", verified: true } : {}) } });
  redirect("/login?verified=1");
}

export async function resendCode(email: string) {
  const u = await prisma.user.findUnique({ where: { email } });
  const lim = await guard(`resend:${clientIp()}`, 10, 3600);
  let q = lim ? `error=${encodeURIComponent(lim)}` : "sent=1";
  if (!lim && u && !u.emailVerified) { const r = await issueOtp(email, "VERIFY"); if (!r.ok) q = `error=${encodeURIComponent(`Please wait ${r.wait}s before requesting another code`)}`; }
  redirect(`/verify-otp?email=${encodeURIComponent(email)}&${q}`);
}
