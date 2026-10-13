import { prisma } from "@/lib/prisma";
import { DOC_LABEL, REQUIRED } from "@/data/constants/documents";
import { notify } from "@/services/notification/notify";
import { audit } from "@/lib/audit";

export async function missingDocs(userId: string, role: string) {
  const req = REQUIRED[role]; if (!req) return [];
  const ok = await prisma.document.findMany({ where: { userId, status: "APPROVED" }, select: { kind: true } });
  return req.filter((k) => !ok.some((o) => o.kind === k)).map((k) => DOC_LABEL[k]);
}
// Once every required document is approved, a pending driver/vendor becomes active automatically.
export async function autoVerify(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u || u.status !== "PENDING" || !u.emailVerified || !REQUIRED[u.role] || (await missingDocs(userId, u.role)).length) return;
  await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE", verified: true } });
  await notify(prisma, userId, "Account verified", "All your documents were approved. You can now use TMS.");
  await audit(null, "user.auto_verified", userId);
}
