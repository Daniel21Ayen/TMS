"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import type { TicketStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ticketSchema } from "@/lib/validators";
import { supportPath } from "@/lib/utils";
import { guard, clientIp } from "@/lib/rate-limit";
import { notify } from "@/services/notification/notify";

async function me() { const s = await getServerSession(authOptions); if (!s) throw new Error("Unauthorized"); return s.user; }

export async function createTicket(formData: FormData) {
  const u = await me();
  const back = (m: string) => redirect(`${supportPath(u.role)}?error=${encodeURIComponent(m)}`);
  const lim = await guard(`ticket:${u.id}`, 5, 3600);
  if (lim) return back(lim);
  const p = ticketSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return back(p.error.issues[0].message);
  const { message, ...rest } = p.data;
  const t = await prisma.ticket.create({ data: { ...rest, userId: u.id, replies: { create: { body: message, authorId: u.id } } } });
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(admins.map((a) => notify(prisma, a.id, "New support ticket", `${rest.subject} (${rest.priority.toLowerCase()} priority)`)));
  redirect(`/support/${t.id}`);
}

export async function replyTicket(id: string, formData: FormData) {
  const u = await me(), admin = u.role === "ADMIN";
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  const t = await prisma.ticket.findUnique({ where: { id } });
  if (!body || !t || (!admin && t.userId !== u.id)) return;
  const status: TicketStatus = admin && t.status === "OPEN" ? "IN_PROGRESS" : !admin && t.status === "RESOLVED" ? "OPEN" : t.status; // customer reply reopens
  await prisma.$transaction([prisma.ticketReply.create({ data: { ticketId: id, authorId: u.id, body } }), prisma.ticket.update({ where: { id }, data: { status } })]);
  if (admin) await notify(prisma, t.userId, "Support replied", `New reply on "${t.subject}".`);
  revalidatePath(`/support/${id}`);
}

export async function setTicketStatus(id: string, status: TicketStatus) {
  const u = await me();
  if (u.role !== "ADMIN") throw new Error("Forbidden");
  const t = await prisma.ticket.update({ where: { id }, data: { status } });
  if (status === "RESOLVED") await notify(prisma, t.userId, "Ticket resolved", `"${t.subject}" was marked as resolved.`);
  revalidatePath("/support", "layout"); revalidatePath("/admin/support-center");
}
