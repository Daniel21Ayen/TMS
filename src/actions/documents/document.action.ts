"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { autoVerify } from "@/lib/documents";
import { DOC_LABEL, REQUIRED } from "@/data/constants/documents";
import { notify } from "@/services/notification/notify";

const MAX = 3 * 1024 * 1024;
// trust the file's real bytes, not the browser-supplied type
function sniff(b: Buffer) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return "image/png";
  if (b.subarray(0, 4).toString("latin1") === "%PDF") return "application/pdf";
  return null;
}

export async function uploadDocument(kind: string, formData: FormData) {
  const s = await getServerSession(authOptions);
  if (!s || !REQUIRED[s.user.role]) throw new Error("Forbidden");
  const u = s.user, home = `/${u.role.toLowerCase()}/documents`;
  const back = (m: string) => redirect(`${home}?error=${encodeURIComponent(m)}`);
  if (!REQUIRED[u.role].includes(kind as never)) return back("Invalid document type");
  const lim = await guard(`upload:${u.id}`, 10, 3600);
  if (lim) return back(lim);
  const f = formData.get("file");
  if (!(f instanceof File) || f.size === 0) return back("Choose a file to upload");
  if (f.size > MAX) return back("File is too large (max 3 MB)");
  const buf = Buffer.from(await f.arrayBuffer()), mime = sniff(buf);
  if (!mime) return back("Only JPG, PNG or PDF files are allowed");
  if (await prisma.document.findFirst({ where: { userId: u.id, kind, status: "APPROVED" } })) return back("This document is already approved");
  await prisma.$transaction([
    prisma.document.deleteMany({ where: { userId: u.id, kind } }), // replaces any earlier pending/rejected upload
    prisma.document.create({ data: { userId: u.id, kind, filename: f.name.replace(/[^\w.\- ]/g, "_").slice(0, 80), mime, size: buf.length, data: buf } })]);
  const have = await prisma.document.findMany({ where: { userId: u.id }, select: { kind: true } });
  if (REQUIRED[u.role].every((k) => have.some((h) => h.kind === k))) { // full set submitted: tell admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await Promise.all(admins.map((a) => notify(prisma, a.id, "Documents ready for review", `${u.name} submitted all required documents.`)));
  }
  revalidatePath(home);
  redirect(`${home}?ok=1`);
}

export async function reviewDocument(id: string, approve: boolean, formData: FormData) {
  const s = await getServerSession(authOptions);
  if (s?.user.role !== "ADMIN") throw new Error("Forbidden");
  const note = approve ? null : String(formData.get("note") ?? "").trim().slice(0, 200) || "Rejected";
  const d = await prisma.document.findUnique({ where: { id }, select: { userId: true, kind: true } });
  if (!d || !(await prisma.document.updateMany({ where: { id, status: "PENDING" }, data: { status: approve ? "APPROVED" : "REJECTED", note, reviewedAt: new Date() } })).count) return;
  const label = (DOC_LABEL as Record<string, string>)[d.kind];
  await notify(prisma, d.userId, approve ? "Document approved" : "Document rejected", approve ? `${label} was approved.` : `${label} was rejected: ${note}. Please upload a new one.`);
  await audit(s.user.id, approve ? "document.approve" : "document.reject", id, d.kind);
  if (approve) await autoVerify(d.userId);
  revalidatePath("/admin", "layout");
}
