"use server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canMessage } from "@/lib/contacts";
import { guard, clientIp } from "@/lib/rate-limit";

export async function sendMessage(toId: string, formData: FormData) {
  const s = await getServerSession(authOptions);
  if (!s) throw new Error("Unauthorized");
  const body = String(formData.get("body") ?? "").trim().slice(0, 1000);
  if (!body || (await guard(`msg:${s.user.id}`, 30, 60)) || !(await canMessage(s.user.id, toId))) return;
  await prisma.message.create({ data: { body, senderId: s.user.id, recipientId: toId } });
  revalidatePath("/messages", "layout");
}
