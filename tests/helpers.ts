import { vi } from "vitest";
import { getServerSession } from "next-auth";
import type { Role, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
export { prisma };

export async function resetDb() {
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
  await prisma.$executeRawUnsafe(`TRUNCATE ${rows.map((r) => `"${r.tablename}"`).join(",")} RESTART IDENTITY CASCADE`);
}
let n = 0;
export async function makeUser(role: Role, o: { balance?: number; status?: UserStatus } = {}) {
  n++; const status = o.status ?? "ACTIVE";
  return prisma.user.create({ data: { name: `${role} ${n}`, email: `${role.toLowerCase()}${n}@test.et`, passwordHash: "x", role, status, verified: status === "ACTIVE", wallet: { create: { balance: o.balance ?? 0 } } } });
}
export const asUser = (u: { id: string; role: Role; name: string; email: string }) =>
  vi.mocked(getServerSession).mockResolvedValue({ user: { id: u.id, role: u.role, name: u.name, email: u.email }, expires: "" } as never);
export const bal = async (userId: string) => Number((await prisma.wallet.findUniqueOrThrow({ where: { userId } })).balance);
export const form = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };
/** Runs an action and returns the (decoded) redirect target, or null if it didn't redirect. */
export async function redirected(p: Promise<unknown>) {
  try { await p; } catch (e) { const m = (e as Error).message; if (m.startsWith("REDIRECT:")) return decodeURIComponent(m.slice(9)); throw e; }
  return null;
}
