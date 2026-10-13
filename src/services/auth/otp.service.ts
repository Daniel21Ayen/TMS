import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { OtpPurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/services/email/email.service";

const TTL = 10 * 60_000, MAX_ATTEMPTS = 5, COOLDOWN = 60_000;
const COPY = { VERIFY: "verify your email address", RESET: "reset your password" } as const;

export async function issueOtp(email: string, purpose: OtpPurpose) {
  const last = await prisma.otpCode.findFirst({ where: { email, purpose }, orderBy: { createdAt: "desc" } });
  const age = last ? Date.now() - last.createdAt.getTime() : Infinity;
  if (age < COOLDOWN) return { ok: false as const, wait: Math.ceil((COOLDOWN - age) / 1000) };
  const code = String(crypto.randomInt(100000, 1000000));
  await prisma.otpCode.deleteMany({ where: { email, purpose } });
  await prisma.otpCode.create({ data: { email, purpose, codeHash: await bcrypt.hash(code, 8), expiresAt: new Date(Date.now() + TTL) } });
  await sendEmail({ to: email, subject: `Your TMS code: ${code}`, text: `Use this code to ${COPY[purpose]}: ${code}\nIt expires in 10 minutes. If you didn't request it, ignore this email.` });
  return { ok: true as const };
}

export async function verifyOtp(email: string, purpose: OtpPurpose, code: string) {
  const o = await prisma.otpCode.findFirst({ where: { email, purpose }, orderBy: { createdAt: "desc" } });
  if (!o || o.expiresAt < new Date()) return false;
  if (o.attempts >= MAX_ATTEMPTS) { await prisma.otpCode.delete({ where: { id: o.id } }); return false; }
  if (!(await bcrypt.compare(code, o.codeHash))) { await prisma.otpCode.update({ where: { id: o.id }, data: { attempts: { increment: 1 } } }); return false; }
  await prisma.otpCode.deleteMany({ where: { email, purpose } });
  return true;
}
