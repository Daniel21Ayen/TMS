import { notFound } from "next/navigation";
import { SendHorizonal } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canMessage } from "@/lib/contacts";
import { sendMessage } from "@/actions/messages/send-message.action";
import AutoRefresh from "@/components/messaging/AutoRefresh";
export const dynamic = "force-dynamic";
export default async function Chat({ params }: { params: { id: string } }) {
  const me = (await getServerSession(authOptions))!.user.id;
  const other = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, name: true, role: true } });
  if (!other || other.id === me) notFound();
  await prisma.message.updateMany({ where: { senderId: other.id, recipientId: me, read: false }, data: { read: true } });
  const [msgs, allowed] = await Promise.all([
    prisma.message.findMany({ where: { OR: [{ senderId: me, recipientId: other.id }, { senderId: other.id, recipientId: me }] }, orderBy: { createdAt: "desc" }, take: 100 }),
    canMessage(me, other.id)]);
  return (
    <>
      <AutoRefresh />
      <header className="flex items-center gap-3 border-b border-slate-100 p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-semibold text-brand-600">{other.name[0]}</span>
        <div><p className="font-semibold">{other.name}</p><p className="text-xs capitalize text-slate-400">{other.role.toLowerCase()}</p></div></header>
      <div className="flex flex-1 flex-col-reverse gap-2 overflow-y-auto bg-slate-50/60 p-4">{/* newest first + column-reverse keeps the view pinned to the latest message */}
        {msgs.map((m) => { const mine = m.senderId === me; return (
          <div key={m.id} className={`flex ${mine ? "justify-end" : ""}`}><div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm bg-white shadow-card"}`}>
            <p className="whitespace-pre-wrap break-words">{m.body}</p><p className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-slate-400"}`}>{m.createdAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p></div></div>); })}
        {!msgs.length && <p className="m-auto text-sm text-slate-400">Say hello 👋</p>}
      </div>
      {allowed ? <form action={sendMessage.bind(null, other.id)} className="flex gap-2 border-t border-slate-100 p-3">
        <input name="body" required maxLength={1000} autoComplete="off" placeholder="Type a message..." className="flex-1 rounded-xl bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
        <button title="Send" className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700"><SendHorizonal className="h-5 w-5" /></button></form>
        : <p className="border-t border-slate-100 p-4 text-center text-sm text-slate-400">You can&apos;t message this user.</p>}
    </>
  );
}
