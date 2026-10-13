"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { missingDocs } from "@/lib/documents";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

// PENDING -> ACTIVE (verify), ACTIVE -> SUSPENDED, SUSPENDED -> ACTIVE
export async function toggleUserStatus(id: string) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "ADMIN") throw new Error("Forbidden");
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u || u.id === s.user.id) return;
  const next = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  if (next === "ACTIVE" && !u.verified && u.role !== "CUSTOMER") { // first-time verification requires approved documents
    const missing = await missingDocs(u.id, u.role);
    if (missing.length) redirect(`/admin/users/${id}?error=${encodeURIComponent("Approve all required documents first: " + missing.join(", "))}`);
  }
  await prisma.user.update({ where: { id }, data: { status: next, verified: next === "ACTIVE" ? true : u.verified } });
  await audit(s.user.id, "user.status", u.id, `${u.email}: ${u.status} → ${next}`);
  revalidatePath("/admin", "layout");
}
