import { prisma } from "@/lib/prisma";
type C = { id: string; name: string; role: string };
const pick = { select: { id: true, name: true, role: true } };

// People you have a real business relationship with (shared shipment or marketplace order)
export async function getContacts(me: string): Promise<C[]> {
  const [a, b, c, d] = await Promise.all([
    prisma.load.findMany({ where: { postedById: me, driverId: { not: null } }, select: { driver: pick }, distinct: ["driverId"] }),
    prisma.load.findMany({ where: { driverId: me }, select: { postedBy: pick }, distinct: ["postedById"] }),
    prisma.vendorOrder.findMany({ where: { customerId: me }, select: { vendor: pick }, distinct: ["vendorId"] }),
    prisma.vendorOrder.findMany({ where: { vendorId: me }, select: { customer: pick }, distinct: ["customerId"] }),
  ]);
  const all = [...a.map((x) => x.driver), ...b.map((x) => x.postedBy), ...c.map((x) => x.vendor), ...d.map((x) => x.customer)].filter(Boolean) as C[];
  return [...new Map(all.map((u) => [u.id, u])).values()];
}
// Anti-spam: related users, or someone who already wrote to you (lets admins reply)
export async function canMessage(me: string, other: string) {
  if (me === other) return false;
  if ((await getContacts(me)).some((u) => u.id === other)) return true;
  return !!(await prisma.message.findFirst({ where: { senderId: other, recipientId: me }, select: { id: true } }));
}
