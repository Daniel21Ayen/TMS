import { MessageSquarePlus } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getContacts } from "@/lib/contacts";
import { timeAgo } from "@/lib/utils";
import ConvLink from "@/components/messaging/ConvLink";
export const dynamic = "force-dynamic";
const Avatar = ({ n }: { n: string }) => <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">{n[0]}</span>;
export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const me = (await getServerSession(authOptions))!.user.id;
  const [msgs, contacts] = await Promise.all([
    prisma.message.findMany({ where: { OR: [{ senderId: me }, { recipientId: me }] }, include: { sender: true, recipient: true }, orderBy: { createdAt: "desc" }, take: 300 }),
    getContacts(me)]);
  const convs = new Map<string, { id: string; name: string; last: string; at: Date; unread: number }>();
  for (const m of msgs) {
    const o = m.senderId === me ? m.recipient : m.sender, c = convs.get(o.id) ?? { id: o.id, name: o.name, last: m.body, at: m.createdAt, unread: 0 };
    if (m.recipientId === me && !m.read) c.unread++;
    convs.set(o.id, c);
  }
  const fresh = contacts.filter((c) => !convs.has(c.id));
  return (
    <div className="grid h-[calc(100vh-8.5rem)] gap-4 lg:grid-cols-[340px_1fr]">
      <aside className="card flex flex-col overflow-hidden">
        <div className="border-b border-slate-100 p-4"><h1 className="text-xl font-bold">Messages</h1><p className="text-xs text-slate-500">Stay in touch with drivers, vendors and customers.</p></div>
        <div className="flex-1 overflow-y-auto p-2">
          {[...convs.values()].map((c) => (
            <ConvLink key={c.id} href={`/messages/${c.id}`}><Avatar n={c.name} />
              <span className="min-w-0 flex-1"><span className="flex justify-between"><b className="truncate text-sm">{c.name}</b><span className="text-[11px] text-slate-400">{timeAgo(c.at)}</span></span><span className="block truncate text-xs text-slate-500">{c.last}</span></span>
              {c.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{c.unread}</span>}</ConvLink>))}
          {!!fresh.length && <p className="flex items-center gap-2 px-3 pb-1 pt-4 text-xs font-semibold uppercase text-slate-400"><MessageSquarePlus className="h-3.5 w-3.5" />Start a chat</p>}
          {fresh.map((c) => <ConvLink key={c.id} href={`/messages/${c.id}`}><Avatar n={c.name} /><span><b className="block text-sm">{c.name}</b><span className="text-xs capitalize text-slate-400">{c.role.toLowerCase()}</span></span></ConvLink>)}
          {!convs.size && !fresh.length && <p className="p-6 text-center text-sm text-slate-400">No conversations yet. Chats unlock after a shipment or order together.</p>}
        </div>
      </aside>
      <section className="card flex min-h-0 flex-col overflow-hidden">{children}</section>
    </div>
  );
}
