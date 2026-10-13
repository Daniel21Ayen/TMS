import { prisma } from "@/lib/prisma";
// Never let a logging failure break the user's action.
export const audit = (actorId: string | null, action: string, target?: string, meta?: string) =>
  prisma.auditLog.create({ data: { actorId, action, target, meta } }).catch((e) => console.error("audit failed", e));
